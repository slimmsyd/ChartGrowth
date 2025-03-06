using Microsoft.AspNetCore.Mvc;
using Trade.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalhostPolicy",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials()
                  .SetIsOriginAllowed(_ => true); 
        });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<ITradesQueryable, RandomTradesQueryable>(sp => {
    var queryable = new RandomTradesQueryable();
    queryable.Initialize();
    
    return queryable;
});builder.Services.AddScoped<ITradesService, TradesService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("LocalhostPolicy");
app.UseHttpsRedirection();

app.MapGet("api/trades", (
    [FromQuery] DateTime startTimestamp, 
    [FromQuery] decimal minQuoteSize,
    ITradesService tradesService) =>
{
    try 
    {
        var trades = tradesService.GetTradesAsync(startTimestamp, minQuoteSize);
        return Results.Ok(trades);
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
})
.WithName("GetTrades")
.WithOpenApi();

app.Run();
