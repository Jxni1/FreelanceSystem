using LabCourse2.Application.Common;
using LabCourse2.Application.DTOs.Messages;
using LabCourse2.Application.Interfaces;
using LabCourse2.Application.Interfaces.Messages;
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

            var contract = await _context.Contracts
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(f => f.User)
                .FirstOrDefaultAsync(c => c.ContractID == request.ContractID);

            if (contract is null)
                return Result<ConversationResponse>.NotFound("Contract not found.");

            var isParticipant =
                contract.Client.UserID == _currentUser.UserId ||
                contract.Freelancer.UserID == _currentUser.UserId ||
                _currentUser.IsAdmin;

            if (!isParticipant)
                return Result<ConversationResponse>.Forbidden("Access denied.");

            var existing = await _context.Conversations
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(c => c.User)
                .Include(c => c.Messages)
                .FirstOrDefaultAsync(c => c.ContractID == request.ContractID);

            if (existing is not null)
            {
                return Result<ConversationResponse>.Success(new ConversationResponse
                {
                    ConversationID = existing.ConversationID,
                    ContractID = existing.ContractID,
                    ClientID = existing.ClientID,
                    ClientUsername = existing.Client.User.Username,
                    FreelancerID = existing.FreelancerID,
                    FreelancerUsername = existing.Freelancer.User.Username,
                    LastMessage = existing.Messages
                        .OrderByDescending(m => m.Sent_at)
                        .Select(m => m.Content)
                        .FirstOrDefault(),
                    LastMessageAt = existing.Messages
                        .OrderByDescending(m => m.Sent_at)
                        .Select(m => (DateTime?)m.Sent_at)
                        .FirstOrDefault(),
                    UpdatedAt = existing.Updated_at
                });
            }

            var username = _currentUser.Username ?? "System";

            var conversation = new Domain.Entities.Conversation
            {
                ConversationID = Guid.NewGuid(),
                ContractID = contract.ContractID,
                ClientID = contract.ClientID,
                FreelancerID = contract.FreelancerID,
                Created_at = DateTime.UtcNow,
                Updated_at = DateTime.UtcNow,
                Created_by = username,
                Updated_by = username
            };

            await _context.Conversations.AddAsync(conversation);
            await _context.SaveChangesAsync();

            return Result<ConversationResponse>.Created(new ConversationResponse
            {
                ConversationID = conversation.ConversationID,
                ContractID = conversation.ContractID,
                ClientID = contract.ClientID,
                ClientUsername = contract.Client.User.Username,
                FreelancerID = contract.FreelancerID,
                FreelancerUsername = contract.Freelancer.User.Username,
                LastMessage = null,
                LastMessageAt = null,
                UpdatedAt = conversation.Updated_at
            });
        }

        public async Task<Result<IEnumerable<ConversationResponse>>> GetMyConversationsAsync()
        {
            if (!_currentUser.IsAuthenticated)
                return Result<IEnumerable<ConversationResponse>>.Unauthorized("Authentication required.");

            var query = _context.Conversations
                .AsNoTracking()
                .Include(c => c.Client).ThenInclude(c => c.User)
                .Include(c => c.Freelancer).ThenInclude(c => c.User)
                .Include(c => c.Messages)
                .AsQueryable();

            if (!_currentUser.IsAdmin)
            {
                query = query.Where(c =>
                    c.Client.UserID == _currentUser.UserId ||
                    c.Freelancer.UserID == _currentUser.UserId);
            }

            var items = await query
                .OrderByDescending(c => c.Updated_at)
                .Select(c => new ConversationResponse
                {
                    ConversationID = c.ConversationID,
                    ContractID = c.ContractID,
                    ClientID = c.ClientID,
                    ClientUsername = c.Client.User.Username,
                    FreelancerID = c.FreelancerID,
                    FreelancerUsername = c.Freelancer.User.Username,
                    LastMessage = c.Messages
                        .OrderByDescending(m => m.Sent_at)
                        .Select(m => m.Content)
                        .FirstOrDefault(),
                    LastMessageAt = c.Messages
                        .OrderByDescending(m => m.Sent_at)
                        .Select(m => (DateTime?)m.Sent_at)
                        .FirstOrDefault(),
                    UpdatedAt = c.Updated_at
                })
                .ToListAsync();

            return Result<IEnumerable<ConversationResponse>>.Success(items);
        }

        public async Task<Result<PagedResult<MessageResponse>>> GetMessagesAsync(
            Guid conversationId,
            MessageQueryParams query)
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
                conversation.Freelancer.UserID == _currentUser.UserId ||
                _currentUser.IsAdmin;

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
            try
            {
                Console.WriteLine("===== SEND MESSAGE START =====");
                Console.WriteLine($"Request ConversationID: {request.ConversationID}");
                Console.WriteLine($"Request Content: {request.Content}");
                Console.WriteLine($"Current UserId: {_currentUser.UserId}");
                Console.WriteLine($"Current Username: {_currentUser.Username}");
                Console.WriteLine($"IsAuthenticated: {_currentUser.IsAuthenticated}");
                Console.WriteLine($"IsAdmin: {_currentUser.IsAdmin}");

                if (!_currentUser.IsAuthenticated)
                {
                    Console.WriteLine("User is not authenticated.");
                    return Result<MessageResponse>.Unauthorized("Authentication required.");
                }

                if (string.IsNullOrWhiteSpace(request.Content))
                {
                    Console.WriteLine("Message content is empty.");
                    return Result<MessageResponse>.Failure("Message content is required.");
                }

                var conversation = await _context.Conversations
                    .Include(c => c.Client).ThenInclude(c => c.User)
                    .Include(c => c.Freelancer).ThenInclude(c => c.User)
                    .FirstOrDefaultAsync(c => c.ConversationID == request.ConversationID);

                if (conversation is null)
                {
                    Console.WriteLine("Conversation not found.");
                    return Result<MessageResponse>.NotFound("Conversation not found.");
                }

                Console.WriteLine($"Conversation found: {conversation.ConversationID}");
                Console.WriteLine($"Client UserID: {conversation.Client.UserID}");
                Console.WriteLine($"Freelancer UserID: {conversation.Freelancer.UserID}");

                var isParticipant =
                    conversation.Client.UserID == _currentUser.UserId ||
                    conversation.Freelancer.UserID == _currentUser.UserId ||
                    _currentUser.IsAdmin;

                Console.WriteLine($"IsParticipant: {isParticipant}");

                if (!isParticipant)
                {
                    Console.WriteLine("Access denied.");
                    return Result<MessageResponse>.Forbidden("Access denied.");
                }

                var username = _currentUser.Username ?? "Unknown";

                var message = new Domain.Entities.Message
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

                Console.WriteLine($"Before add: MessageID={message.MessageID}");

                await _context.Messages.AddAsync(message);
                Console.WriteLine("Message added to DbSet.");

                conversation.Updated_at = DateTime.UtcNow;
                conversation.Updated_by = username;

                var affectedRows = await _context.SaveChangesAsync();
                Console.WriteLine($"SaveChangesAsync affected rows: {affectedRows}");

                var existsInDb = await _context.Messages
                    .AsNoTracking()
                    .AnyAsync(m => m.MessageID == message.MessageID);

                Console.WriteLine($"Exists in DB after save: {existsInDb}");
                Console.WriteLine("===== SEND MESSAGE END =====");

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
            catch (Exception ex)
            {
                Console.WriteLine("===== SEND MESSAGE ERROR =====");
                Console.WriteLine(ex.ToString());
                return Result<MessageResponse>.Failure($"Failed to send message: {ex.Message}");
            }
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
                conversation.Freelancer.UserID == _currentUser.UserId ||
                _currentUser.IsAdmin;

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
    }
}