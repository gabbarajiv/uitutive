@echo off
REM Docker Helper Script for Uitutive (Windows)
REM Provides convenient commands for Docker operations

setlocal enabledelayedexpansion

REM Colors and formatting
set GREEN=[92m
set YELLOW=[93m
set BLUE=[94m
set RED=[91m
set RESET=[0m

REM Helper functions
goto :skip_functions

:print_info
    echo %BLUE%[INFO] %1%RESET%
    goto :eof

:print_success
    echo %GREEN%[SUCCESS] %1%RESET%
    goto :eof

:print_warning
    echo %YELLOW%[WARNING] %1%RESET%
    goto :eof

:print_error
    echo %RED%[ERROR] %1%RESET%
    goto :eof

:print_header
    echo.
    echo %BLUE%============ %1 ============%RESET%
    echo.
    goto :eof

:skip_functions

if "%1"=="" goto :show_help
if "%1"=="help" goto :show_help
if "%1"=="--help" goto :show_help
if "%1"=="-h" goto :show_help

if "%1"=="build" goto :build_images
if "%1"=="up" goto :start_services
if "%1"=="down" goto :stop_services
if "%1"=="restart" goto :restart_services
if "%1"=="logs" goto :show_logs
if "%1"=="shell" goto :open_shell
if "%1"=="status" goto :show_status
if "%1"=="health" goto :check_health
if "%1"=="setup-ollama" goto :setup_ollama
if "%1"=="clean" goto :clean_resources
if "%1"=="prune" goto :deep_clean

echo Unknown command: %1
goto :show_help

:show_help
    cls
    echo.
    echo %BLUE%Uitutive Docker Helper%RESET%
    echo.
    echo %GREEN%Usage:%RESET%
    echo     docker-helper.bat [command] [options]
    echo.
    echo %GREEN%Commands:%RESET%
    echo     build                   Build Docker images
    echo     up [env]               Start all services (default: .env.docker)
    echo     down                   Stop all services
    echo     restart                Restart all services
    echo     logs [service]         View logs (all or specific service)
    echo     shell [service]        Open shell in container
    echo     clean                  Remove stopped containers and volumes
    echo     prune                  Deep clean - remove all unused resources
    echo     status                 Show container status
    echo     setup-ollama           Pull Ollama model (llama2)
    echo     health                 Check service health
    echo     help                   Show this help message
    echo.
    echo %GREEN%Environment Options:%RESET%
    echo     dev                    Use .env.docker.dev (development)
    echo     prod                   Use .env.docker.prod (production)
    echo     custom [file]          Use custom .env file
    echo.
    echo %GREEN%Examples:%RESET%
    echo     docker-helper.bat up dev              # Start with dev environment
    echo     docker-helper.bat logs uitutive       # View application logs
    echo     docker-helper.bat shell postgres      # Open PostgreSQL shell
    echo.
    goto :eof

:build_images
    call :print_header "Building Docker Images"
    docker-compose build
    call :print_success "Images built successfully"
    goto :eof

:start_services
    set ENV_FILE=.env.docker
    
    if "%2"=="dev" (
        set ENV_FILE=.env.docker.dev
    ) else if "%2"=="prod" (
        set ENV_FILE=.env.docker.prod
    )
    
    if not exist "%ENV_FILE%" (
        call :print_error "Environment file not found: %ENV_FILE%"
        goto :eof
    )
    
    call :print_header "Starting Services with %ENV_FILE%"
    docker-compose --env-file %ENV_FILE% up -d
    
    call :print_success "Services started successfully"
    call :print_info "Waiting for services to be ready..."
    timeout /t 5 /nobreak
    
    call :print_info "Service Status:"
    docker-compose --env-file %ENV_FILE% ps
    goto :eof

:stop_services
    call :print_header "Stopping Services"
    docker-compose down
    call :print_success "Services stopped"
    goto :eof

:restart_services
    call :print_header "Restarting Services"
    docker-compose restart
    call :print_success "Services restarted"
    goto :eof

:show_logs
    if "%2"=="" (
        call :print_header "Application Logs"
        docker-compose logs -f
    ) else (
        call :print_header "Logs for %2"
        docker-compose logs -f %2
    )
    goto :eof

:open_shell
    set CONTAINER=uitutive-app
    if not "%2"=="" set CONTAINER=%2
    
    call :print_info "Opening shell in %CONTAINER%..."
    docker exec -it %CONTAINER% sh
    goto :eof

:show_status
    call :print_header "Container Status"
    docker-compose ps
    
    call :print_header "Resource Usage"
    docker stats --no-stream
    goto :eof

:check_health
    call :print_header "Service Health Check"
    
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/v1' -ErrorAction Stop; Write-Host '[OK] Application is healthy' -ForegroundColor Green } catch { Write-Host '[FAILED] Application health check failed' -ForegroundColor Red }"
    
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:11434' -ErrorAction Stop; Write-Host '[OK] Ollama is running' -ForegroundColor Green } catch { Write-Host '[WARNING] Ollama is not responding' -ForegroundColor Yellow }"
    
    goto :eof

:setup_ollama
    call :print_header "Setting up Ollama"
    
    docker-compose ps | find "ollama" >nul
    if errorlevel 1 (
        call :print_error "Ollama container is not running"
        goto :eof
    )
    
    call :print_info "Pulling llama2 model (this may take several minutes)..."
    docker exec ollama-service ollama pull llama2
    
    call :print_success "Ollama model setup complete"
    call :print_info "Available models:"
    docker exec ollama-service ollama list
    goto :eof

:clean_resources
    call :print_header "Cleaning Docker Resources"
    call :print_warning "This will remove stopped containers and volumes"
    
    set /p CONFIRM=Continue? (y/n): 
    if /i "%CONFIRM%"=="y" (
        docker-compose down -v
        call :print_success "Cleanup complete"
    ) else (
        call :print_info "Cleanup cancelled"
    )
    goto :eof

:deep_clean
    call :print_header "Deep Clean - Removing All Unused Resources"
    call :print_warning "This will remove all stopped containers, unused images, and volumes"
    
    set /p CONFIRM=Continue? (y/n): 
    if /i "%CONFIRM%"=="y" (
        docker-compose down -v --rmi all
        docker system prune -a --volumes -f
        call :print_success "Deep clean complete"
    ) else (
        call :print_info "Deep clean cancelled"
    )
    goto :eof

endlocal
