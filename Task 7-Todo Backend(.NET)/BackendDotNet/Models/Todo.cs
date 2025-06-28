using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace BackendDotNet.Models
{
    public class Todo
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;

        public string Task { get; set; } = null!;
        public bool Completed { get; set; } = false;

        [BsonRepresentation(BsonType.ObjectId)]
        public string UserId { get; set; } = null!;
    }
}