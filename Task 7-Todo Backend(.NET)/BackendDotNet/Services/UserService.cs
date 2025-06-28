using BackendDotNet.DTOs;
using BackendDotNet.Models;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace BackendDotNet.Services
{
    public class UserService : IUserService
    {
        private readonly IMongoCollection<User> _users;
        private readonly IConfiguration _config;

        public UserService(IConfiguration config)
        {
            _config = config;
            var client = new MongoClient(_config["MongoDB:ConnectionString"]);
            var database = client.GetDatabase(_config["MongoDB:Database"]);
            _users = database.GetCollection<User>("Users");
        }

        public async Task<(bool, string)> RegisterAsync(RegisterDto dto)
        {
            var existing = await _users.Find(u => u.Email == dto.Email).FirstOrDefaultAsync();
            if (existing != null)
                return (false, "Email already in use");

            var hashed = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            var newUser = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Password = hashed
            };

            await _users.InsertOneAsync(newUser);
            return (true, "User registered");
        }

        public async Task<(bool, string, string, User?)> LoginAsync(LoginDto dto)
        {
            var user = await _users.Find(u => u.Email == dto.Email).FirstOrDefaultAsync();
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
                return (false, "Invalid credentials", string.Empty, null);

            var claims = new[]
            {
                new Claim("id", user.Id ?? ""),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Name, user.Name ?? "") 
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            return (true, "Login success", new JwtSecurityTokenHandler().WriteToken(token), user);
        }
    }
}
