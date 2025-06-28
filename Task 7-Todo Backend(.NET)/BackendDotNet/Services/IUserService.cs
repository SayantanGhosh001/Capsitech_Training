using BackendDotNet.DTOs;
using BackendDotNet.Models;

namespace BackendDotNet.Services
{
    public interface IUserService
    {
        Task<(bool Success, string Message)> RegisterAsync(RegisterDto dto);
        Task<(bool Success, string Message, string Token, User? user)> LoginAsync(LoginDto dto);
    }
}