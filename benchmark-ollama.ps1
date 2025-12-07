#!/usr/bin/env powershell

<#
.SYNOPSIS
Benchmark Ollama performance with and without GPU

.EXAMPLE
./benchmark-ollama.ps1
#>

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Ollama Performance Benchmark" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if containers are running
$OllamaRunning = docker ps --filter "name=uitutive-ollama" --format "{{.Names}}" 2>$null
if (-not $OllamaRunning) {
    Write-Host "❌ Ollama container not running!" -ForegroundColor Red
    Write-Host "Start it with: docker-compose -f docker-compose.gpu.yml up -d" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Ollama container found: $OllamaRunning" -ForegroundColor Green
Write-Host ""

# Check GPU
Write-Host "Checking GPU status..." -ForegroundColor Cyan
docker exec uitutive-ollama nvidia-smi 2>$null | ForEach-Object { Write-Host $_ }
Write-Host ""

# Get installed models
Write-Host "Installed models:" -ForegroundColor Cyan
$Models = docker exec uitutive-ollama ollama list 2>$null
if ($Models) {
    $Models | ForEach-Object { Write-Host $_ }
}
else {
    Write-Host "No models installed. Run: docker exec uitutive-ollama ollama pull mistral" -ForegroundColor Yellow
}
Write-Host ""

# Benchmark prompt
$Prompt = "Explain quantum computing in 100 words"

Write-Host "Benchmark Settings:" -ForegroundColor Cyan
Write-Host "  Prompt: '$Prompt'" -ForegroundColor Gray
Write-Host "  Each model will run twice for consistency" -ForegroundColor Gray
Write-Host ""

# Models to benchmark
$ModelsToTest = @("mistral", "llama2")

foreach ($Model in $ModelsToTest) {
    Write-Host "Testing model: $Model" -ForegroundColor Yellow
    
    # Check if model exists
    $ModelExists = docker exec uitutive-ollama ollama list 2>$null | Select-String -Pattern $Model
    if (-not $ModelExists) {
        Write-Host "  ⏭️  Model not installed, skipping..." -ForegroundColor Gray
        continue
    }
    
    Write-Host "  Pulling model..." -ForegroundColor Gray
    docker exec uitutive-ollama ollama pull $Model >$null 2>&1
    
    # Run benchmark twice
    for ($i = 1; $i -le 2; $i++) {
        Write-Host "  Run $i/2..." -ForegroundColor Gray
        $StartTime = Get-Date
        
        $Response = docker exec uitutive-ollama ollama generate --model $Model --prompt "$Prompt" 2>$null
        
        $EndTime = Get-Date
        $Duration = ($EndTime - $StartTime).TotalSeconds
        
        Write-Host "    ⏱️  Time: ${Duration}s" -ForegroundColor Green
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Benchmark Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tips for better performance:" -ForegroundColor Cyan
Write-Host "  • Use 'mistral' for fastest responses" -ForegroundColor Gray
Write-Host "  • Ensure GPU is enabled and detected" -ForegroundColor Gray
Write-Host "  • Use latest NVIDIA drivers" -ForegroundColor Gray
Write-Host "  • Monitor with: docker exec uitutive-ollama nvidia-smi -l 1" -ForegroundColor Gray
Write-Host ""
