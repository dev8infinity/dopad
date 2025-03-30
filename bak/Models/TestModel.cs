namespace Test.Models;

public class TestModel
{
    public TestModel(string name)
    {
        Id = Guid.NewGuid();
        Name = name;
    }

    public Guid Id { get; init; }
    public string Name { get; private set; }
}