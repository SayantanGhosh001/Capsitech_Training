using BackendDotNet.DTOs;
using BackendDotNet.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

namespace BackendDotNet.Controllers
{
    [ApiController]
    [Route("api/todos")]
    public class TodoController : ControllerBase
    {
        private readonly IMongoCollection<Todo> _todos;

        public TodoController(IConfiguration config)
        {
            var client = new MongoClient(config["MongoDB:ConnectionString"]);
            var db = client.GetDatabase(config["MongoDB:Database"]);
            _todos = db.GetCollection<Todo>("Todos");
        }

        [HttpGet("/Get-all")]
        public async Task<IActionResult> Get()
        {
            string userId = HttpContext.Items["UserId"]?.ToString() ?? "";
            var todos = await _todos.Find(t => t.UserId == userId).ToListAsync();
            return Ok(todos);
        }

        [HttpPost("/Create")]
        public async Task<IActionResult> Create(TodoDto dto)
        {
            var userId = HttpContext.Items["UserId"]?.ToString();

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated or token is missing/invalid" });
            }

            var todo = new Todo
            {
                Task = dto.Task,
                Completed = dto.Completed,
                UserId = userId
            };

            await _todos.InsertOneAsync(todo);
            return Ok(todo);
        }


        [HttpPut("/Update/{id}")]
        public async Task<IActionResult> Update(string id, TodoDto dto)
        {
            var update = Builders<Todo>.Update
                .Set(t => t.Task, dto.Task)
                .Set(t => t.Completed, dto.Completed);

            await _todos.UpdateOneAsync(t => t.Id == id, update);
            return Ok(new { message = "Updated" });
        }

        [HttpDelete("/Delete/{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _todos.DeleteOneAsync(t => t.Id == id);
            return Ok(new { message = "Deleted" });
        }
    }
}
