using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Messages;
using LabCourse2.Application.Interfaces;
using LabCourse2.Application.Interfaces.Messages;
using LabCourse2.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LabCourse2.Application.Services.Messages
{
    public class MessageService : IMessageService
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUser;

        public MessageService(
            IAppDbContext context,
            ICurrentUserService currentUser)
        {
            _context = context;
            _currentUser = currentUser;
        }

        public async Task<Result<ConversationResponse>> CreateConversationAsync(CreateConversationRequest request)
        {
            if (!_currentUser.IsAuthenticated)
                return Result<ConversationResponse>.Unauthorized("Authentication required.");

            var me = _currentUser.UserId;
            var username = _currentUser.Username ?? "System";

            if (request.ContractID.HasValue)
            {
                var contract = await _context.Contracts
                    .Include(c => c.Client).ThenInclude(c => c.User)
                    .Include(c => c.Freelancer).ThenInclude(f => f.User)
                    .FirstOrDefaultAsync(c => c.ContractID == request.ContractID.Value);

                if (contract is null)
                    return Result<ConversationResponse>.NotFound("Contract not found.");

                var isParticipant =
                    contract.Client.UserID == me ||
                    contract.Freelancer.UserID == me;

                if (!isParticipant)
                    return Result<ConversationResponse>.Forbidden("Access denied.");

                var existingByContract = await _context.Conversations
                    .Include(c => c.Client).ThenInclude(c => c.User)
                    .Include(c => c.Freelancer).ThenInclude(c => c.User)
                    .Include(c => c.Messages)
                    .FirstOrDefaultAsync(c => c.ContractID == contract.ContractID);

                if (existingByContract is not null)
                    return Result<ConversationResponse>.Success(MapConversation(existingByContract));

                var acceptedConversation = new Conversation
                {
                    ConversationID = Guid.NewGuid(),
                    ContractID = contract.ContractID,
                    ClientID = contract.ClientID,
                    FreelancerID = contract.FreelancerID,
                    Status = "Accepted",
                    RequestedByUserID = me,
                    RespondedAt = DateTime.UtcNow,
                    Created_at = DateTime.UtcNow,
                    Updated_at = DateTime.UtcNow,
                    Created_by = username,
                    Updated_by = username
                };

                await _context.Conversations.AddAsync(acceptedConversation);
                await _context.SaveChangesAsync();

                return Result<ConversationResponse>.Created(MapConversationFromContract(acceptedConversation, contract));
            }

            if (!request.ClientID.HasValue || !request.FreelancerID.HasValue)
                return Result<ConversationResponse>.Failure("ClientID and FreelancerID are required when ContractID is not provided.");

            var client = await _context.ClientProfiles
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.ClientID == request.ClientID.Value);

            if (client is null)
                return Result<ConversationResponse>.NotFound("Client not found.");

            var freelancer = await _context.FreelancerProfiles
                .Include(f => f.User)
                .FirstOrDefaultAsync(f => f.FreelancerID == request.FreelancerID.Value);

            if (freelancer is null)
                return Result<ConversationResponse>.NotFound("Freelancer not found.");

            var isParticipantInPair =
                client.UserID == me ||
                freelancer.UserID == me;

            if (!isParticipantInPair)
                return Result<ConversationResponse>.Forbidden("You can only create a conversation involving yourself.");

            var existingConversation = await _context.Conversations
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(c => c.User)
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.ClientID == client.ClientID && c.FreelancerID == freelancer.FreelancerID);

            if (existingConversation is not null)
                return Result<ConversationResponse>.Success(MapConversation(existingConversation));

            var contractBetweenUsers = await _context.Contracts
                .FirstOrDefaultAsync(c => c.ClientID == client.ClientID && c.FreelancerID == freelancer.FreelancerID);

            var conversation = new Conversation
            {
                ConversationID = Guid.NewGuid(),
                ContractID = contractBetweenUsers?.ContractID,
                ClientID = client.ClientID,
                FreelancerID = freelancer.FreelancerID,
                Status = contractBetweenUsers is null ? "Pending" : "Accepted",
                RequestedByUserID = me,
                RespondedAt = contractBetweenUsers is null ? null : DateTime.UtcNow,
                Created_at = DateTime.UtcNow,
                Updated_at = DateTime.UtcNow,
                Created_by = username,
                Updated_by = username
            };

            await _context.Conversations.AddAsync(conversation);

            if (!string.IsNullOrWhiteSpace(request.InitialMessage))
            {
                var message = new Message
                {
                    MessageID = Guid.NewGuid(),
                    ConversationID = conversation.ConversationID,
                    SenderUserID = me,
                    Content = request.InitialMessage.Trim(),
                    IsRead = false,
                    Sent_at = DateTime.UtcNow,
                    Created_at = DateTime.UtcNow,
                    Updated_at = DateTime.UtcNow,
                    Created_by = username,
                    Updated_by = username
                };

                await _context.Messages.AddAsync(message);
            }

            await _context.SaveChangesAsync();

            var created = await _context.Conversations
                .AsNoTracking()
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(c => c.User)
                .Include(c => c.Messages)
                .FirstAsync(c => c.ConversationID == conversation.ConversationID);

            return Result<ConversationResponse>.Created(MapConversation(created));
        }

        public async Task<Result<IEnumerable<ConversationResponse>>> GetMyConversationsAsync()
        {
            if (!_currentUser.IsAuthenticated)
                return Result<IEnumerable<ConversationResponse>>.Unauthorized("Authentication required.");

            var items = await _context.Conversations
                .AsNoTracking()
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(c => c.User)
                .Include(c => c.Messages)
                .Where(c =>
                    (c.Client.UserID == _currentUser.UserId ||
                     c.Freelancer.UserID == _currentUser.UserId) &&
                    c.Status != "Rejected")
                .OrderByDescending(c => c.Updated_at)
                .Select(c => new ConversationResponse
                {
                    ConversationID = c.ConversationID,
                    ContractID = c.ContractID,
                    ClientID = c.ClientID,
                    ClientUserID = c.Client.UserID,
                    ClientUsername = c.Client.User.Username,
                    FreelancerID = c.FreelancerID,
                    FreelancerUserID = c.Freelancer.UserID,
                    FreelancerUsername = c.Freelancer.User.Username,
                    Status = c.Status,
                    RequestedByUserID = c.RequestedByUserID,
                    RespondedAt = c.RespondedAt,
                    LastMessage = c.Messages.OrderByDescending(m => m.Sent_at).Select(m => m.Content).FirstOrDefault(),
                    LastMessageSenderUserID = c.Messages.OrderByDescending(m => m.Sent_at).Select(m => (Guid?)m.SenderUserID).FirstOrDefault(),
                    LastMessageAt = c.Messages.OrderByDescending(m => m.Sent_at).Select(m => (DateTime?)m.Sent_at).FirstOrDefault(),
                    CreatedAt = c.Created_at,
                    UpdatedAt = c.Updated_at
                })
                .ToListAsync();

            return Result<IEnumerable<ConversationResponse>>.Success(items);
        }

        public async Task<Result<IEnumerable<ConversationResponse>>> GetPendingRequestsAsync()
        {
            if (!_currentUser.IsAuthenticated)
                return Result<IEnumerable<ConversationResponse>>.Unauthorized("Authentication required.");

            var items = await _context.Conversations
                .AsNoTracking()
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(c => c.User)
                .Include(c => c.Messages)
                .Where(c =>
                    c.Status == "Pending" &&
                    c.RequestedByUserID != _currentUser.UserId &&
                    (c.Client.UserID == _currentUser.UserId || c.Freelancer.UserID == _currentUser.UserId))
                .OrderByDescending(c => c.Created_at)
                .Select(c => new ConversationResponse
                {
                    ConversationID = c.ConversationID,
                    ContractID = c.ContractID,
                    ClientID = c.ClientID,
                    ClientUserID = c.Client.UserID,
                    ClientUsername = c.Client.User.Username,
                    FreelancerID = c.FreelancerID,
                    FreelancerUserID = c.Freelancer.UserID,
                    FreelancerUsername = c.Freelancer.User.Username,
                    Status = c.Status,
                    RequestedByUserID = c.RequestedByUserID,
                    RespondedAt = c.RespondedAt,
                    LastMessage = c.Messages.OrderByDescending(m => m.Sent_at).Select(m => m.Content).FirstOrDefault(),
                    LastMessageSenderUserID = c.Messages.OrderByDescending(m => m.Sent_at).Select(m => (Guid?)m.SenderUserID).FirstOrDefault(),
                    LastMessageAt = c.Messages.OrderByDescending(m => m.Sent_at).Select(m => (DateTime?)m.Sent_at).FirstOrDefault(),
                    CreatedAt = c.Created_at,
                    UpdatedAt = c.Updated_at
                })
                .ToListAsync();

            return Result<IEnumerable<ConversationResponse>>.Success(items);
        }

        public async Task<Result<PagedResult<MessageResponse>>> GetMessagesAsync(Guid conversationId, MessageQueryParams query)
        {
            if (!_currentUser.IsAuthenticated)
                return Result<PagedResult<MessageResponse>>.Unauthorized("Authentication required.");

            var conversation = await _context.Conversations
                .AsNoTracking()
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(c => c.User)
                .FirstOrDefaultAsync(c => c.ConversationID == conversationId);

            if (conversation is null)
                return Result<PagedResult<MessageResponse>>.NotFound("Conversation not found.");

            var isParticipant =
                conversation.Client.UserID == _currentUser.UserId ||
                conversation.Freelancer.UserID == _currentUser.UserId;

            if (!isParticipant)
                return Result<PagedResult<MessageResponse>>.Forbidden("Access denied.");

            var q = _context.Messages
                .AsNoTracking()
                .Include(m => m.SenderUser)
                .Where(m => m.ConversationID == conversationId);

            var totalCount = await q.CountAsync();

            var items = await q
                .OrderByDescending(m => m.Sent_at)
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(m => new MessageResponse
                {
                    MessageID = m.MessageID,
                    ConversationID = m.ConversationID,
                    SenderUserID = m.SenderUserID,
                    SenderUsername = m.SenderUser.Username,
                    SenderRole = m.SenderUserID == conversation.Client.UserID
                        ? "Client"
                        : m.SenderUserID == conversation.Freelancer.UserID
                            ? "Freelancer"
                            : "User",
                    Content = m.Content,
                    IsRead = m.IsRead,
                    SentAt = m.Sent_at
                })
                .ToListAsync();

            items.Reverse();

            return Result<PagedResult<MessageResponse>>.Success(new PagedResult<MessageResponse>
            {
                Items = items,
                TotalCount = totalCount,
                Page = query.Page,
                PageSize = query.PageSize
            });
        }

        public async Task<Result<MessageResponse>> SendMessageAsync(SendMessageRequest request)
        {
            if (!_currentUser.IsAuthenticated)
                return Result<MessageResponse>.Unauthorized("Authentication required.");

            if (string.IsNullOrWhiteSpace(request.Content))
                return Result<MessageResponse>.Failure("Message content is required.");

            var conversation = await _context.Conversations
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(c => c.User)
                .FirstOrDefaultAsync(c => c.ConversationID == request.ConversationID);

            if (conversation is null)
                return Result<MessageResponse>.NotFound("Conversation not found.");

            var isParticipant =
                conversation.Client.UserID == _currentUser.UserId ||
                conversation.Freelancer.UserID == _currentUser.UserId;

            if (!isParticipant)
                return Result<MessageResponse>.Forbidden("Access denied.");

            if (conversation.Status == "Rejected")
                return Result<MessageResponse>.Failure("This request was rejected.");

            if (conversation.Status == "Pending" && conversation.RequestedByUserID != _currentUser.UserId)
                return Result<MessageResponse>.Failure("You must accept this request before sending messages.");

            var username = _currentUser.Username ?? "Unknown";

            var message = new Message
            {
                MessageID = Guid.NewGuid(),
                ConversationID = conversation.ConversationID,
                SenderUserID = _currentUser.UserId,
                Content = request.Content.Trim(),
                IsRead = false,
                Sent_at = DateTime.UtcNow,
                Created_at = DateTime.UtcNow,
                Updated_at = DateTime.UtcNow,
                Created_by = username,
                Updated_by = username
            };

            await _context.Messages.AddAsync(message);

            conversation.Updated_at = DateTime.UtcNow;
            conversation.Updated_by = username;

            await _context.SaveChangesAsync();

            var response = new MessageResponse
            {
                MessageID = message.MessageID,
                ConversationID = message.ConversationID,
                SenderUserID = message.SenderUserID,
                SenderUsername = username,
                SenderRole = message.SenderUserID == conversation.Client.UserID
                    ? "Client"
                    : message.SenderUserID == conversation.Freelancer.UserID
                        ? "Freelancer"
                        : "User",
                Content = message.Content,
                IsRead = message.IsRead,
                SentAt = message.Sent_at
            };

            return Result<MessageResponse>.Created(response);
        }

        public async Task<Result<ConversationResponse>> RespondToConversationRequestAsync(Guid conversationId, bool accept)
        {
            if (!_currentUser.IsAuthenticated)
                return Result<ConversationResponse>.Unauthorized("Authentication required.");

            var conversation = await _context.Conversations
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(c => c.User)
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.ConversationID == conversationId);

            if (conversation is null)
                return Result<ConversationResponse>.NotFound("Conversation not found.");

            var isParticipant =
                conversation.Client.UserID == _currentUser.UserId ||
                conversation.Freelancer.UserID == _currentUser.UserId;

            if (!isParticipant)
                return Result<ConversationResponse>.Forbidden("Access denied.");

            if (conversation.Status != "Pending")
                return Result<ConversationResponse>.Failure("Only pending requests can be responded to.");

            if (conversation.RequestedByUserID == _currentUser.UserId)
                return Result<ConversationResponse>.Failure("You cannot respond to your own request.");

            conversation.Status = accept ? "Accepted" : "Rejected";
            conversation.RespondedAt = DateTime.UtcNow;
            conversation.Updated_at = DateTime.UtcNow;
            conversation.Updated_by = _currentUser.Username ?? "Unknown";

            await _context.SaveChangesAsync();

            return Result<ConversationResponse>.Success(MapConversation(conversation));
        }

        public async Task<Result<bool>> MarkConversationAsReadAsync(Guid conversationId)
        {
            if (!_currentUser.IsAuthenticated)
                return Result<bool>.Unauthorized("Authentication required.");

            var conversation = await _context.Conversations
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(c => c.User)
                .FirstOrDefaultAsync(c => c.ConversationID == conversationId);

            if (conversation is null)
                return Result<bool>.NotFound("Conversation not found.");

            var isParticipant =
                conversation.Client.UserID == _currentUser.UserId ||
                conversation.Freelancer.UserID == _currentUser.UserId;

            if (!isParticipant)
                return Result<bool>.Forbidden("Access denied.");

            var myUserId = _currentUser.UserId;
            var username = _currentUser.Username ?? "Unknown";

            var unreadMessages = await _context.Messages
                .Where(m => m.ConversationID == conversationId &&
                            m.SenderUserID != myUserId &&
                            !m.IsRead)
                .ToListAsync();

            foreach (var message in unreadMessages)
            {
                message.IsRead = true;
                message.Updated_at = DateTime.UtcNow;
                message.Updated_by = username;
            }

            await _context.SaveChangesAsync();
            return Result<bool>.Success(true);
        }

        public async Task<Result<int>> GetUnreadConversationCountAsync()
        {
            if (!_currentUser.IsAuthenticated)
                return Result<int>.Unauthorized("Authentication required.");

            var myUserId = _currentUser.UserId;

            var count = await _context.Conversations
                .AsNoTracking()
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(c => c.User)
                .Where(c =>
                    c.Client.UserID == myUserId ||
                    c.Freelancer.UserID == myUserId)
                .CountAsync(c => c.Messages.Any(m =>
                    m.SenderUserID != myUserId &&
                    !m.IsRead));

            return Result<int>.Success(count);
        }

        private static ConversationResponse MapConversation(Conversation c)
        {
            var lastMessage = c.Messages
                .OrderByDescending(m => m.Sent_at)
                .FirstOrDefault();

            return new ConversationResponse
            {
                ConversationID = c.ConversationID,
                ContractID = c.ContractID,
                ClientID = c.ClientID,
                ClientUserID = c.Client.UserID,
                ClientUsername = c.Client.User.Username,
                FreelancerID = c.FreelancerID,
                FreelancerUserID = c.Freelancer.UserID,
                FreelancerUsername = c.Freelancer.User.Username,
                Status = c.Status,
                RequestedByUserID = c.RequestedByUserID,
                RespondedAt = c.RespondedAt,
                LastMessage = lastMessage?.Content,
                LastMessageSenderUserID = lastMessage?.SenderUserID,
                LastMessageAt = lastMessage?.Sent_at,
                CreatedAt = c.Created_at,
                UpdatedAt = c.Updated_at
            };
        }

        private static ConversationResponse MapConversationFromContract(Conversation c, Contract contract)
        {
            return new ConversationResponse
            {
                ConversationID = c.ConversationID,
                ContractID = c.ContractID,
                ClientID = c.ClientID,
                ClientUserID = contract.Client.UserID,
                ClientUsername = contract.Client.User.Username,
                FreelancerID = c.FreelancerID,
                FreelancerUserID = contract.Freelancer.UserID,
                FreelancerUsername = contract.Freelancer.User.Username,
                Status = c.Status,
                RequestedByUserID = c.RequestedByUserID,
                RespondedAt = c.RespondedAt,
                LastMessage = null,
                LastMessageSenderUserID = null,
                LastMessageAt = null,
                CreatedAt = c.Created_at,
                UpdatedAt = c.Updated_at
            };
        }
    }
}