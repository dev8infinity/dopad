namespace Test.Routes;
using Test.Data;
using Test.Models;

using Microsoft.EntityFrameworkCore;
public static class TestRoute
{
    public static void TestRoutes(this WebApplication app) 
    {
        var route = app.MapGroup("/test");
        route.MapGet("", async (TestContext context) => {
            var tests = await context.Test.ToListAsync();
            return Results.Ok(tests);
        });
        route.MapPost("", async (TestRequest request, TestContext context) => {
            var test = new TestModel(request.Name);
            await context.AddAsync(test);
            await context.SaveChangesAsync();
            return test;
        });
        // route.MapPut("/{id:guid}", async (Guid id, TestRequest request, TestContext context) => {
        //     var test = await context.Test.FirstOrDefaultAsync(t => t.Id == id);
        //     if (test == null)
        //         return Results.NotFound();
        //     // test.Name = request.Name;
        //     await context.SaveChangesAsync();
        //     return test;
        // });
        // route.MapDelete("/{id:guid}", async (Guid id, TestContext context) => {
        //     var test = await context.Test.FirstOrDefaultAsync(t => t.Id == id);
        //     if (test == null)
        //         return Results.NotFound();
        //     context.Test.Remove(test);
        //     await context.SaveChangesAsync();
        //     return Results.NoContent();
        // });
    }
}