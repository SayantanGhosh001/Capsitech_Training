namespace BackendDotNet.DTOs
{
    public class TodoDto
    {
        public string Task { get; set; } = null!;
        public bool Completed { get; set; } = false;
    }
}