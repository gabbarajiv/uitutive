#!/bin/bash

# Docker Helper Script for Uitutive
# Provides convenient commands for Docker operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

print_header() {
    echo -e "\n${BLUE}=== ${1} ===${NC}\n"
}

# Commands
show_help() {
    cat << EOF
${BLUE}Uitutive Docker Helper${NC}

${GREEN}Usage:${NC}
    ./docker-helper.sh [command] [options]

${GREEN}Commands:${NC}
    build                   Build Docker images
    up [env]               Start all services (default: .env.docker)
    down                   Stop all services
    restart                Restart all services
    logs [service]         View logs (all or specific service)
    shell [service]        Open shell in container
    clean                  Remove stopped containers and volumes
    prune                  Deep clean - remove all unused resources
    status                 Show container status
    setup-ollama           Pull Ollama model (llama2)
    health                 Check service health
    help                   Show this help message

${GREEN}Environment Options:${NC}
    dev                    Use .env.docker.dev (development)
    prod                   Use .env.docker.prod (production)
    custom [file]          Use custom .env file

${GREEN}Examples:${NC}
    ./docker-helper.sh up dev              # Start with dev environment
    ./docker-helper.sh logs -f uitutive    # Follow logs
    ./docker-helper.sh shell postgres      # Open PostgreSQL shell

EOF
}

build_images() {
    print_header "Building Docker Images"
    docker-compose build "$@"
    print_success "Images built successfully"
}

start_services() {
    local env_file=".env.docker"
    
    if [ "$1" = "dev" ]; then
        env_file=".env.docker.dev"
        shift
    elif [ "$1" = "prod" ]; then
        env_file=".env.docker.prod"
        shift
    elif [ "$1" = "custom" ] && [ -n "$2" ]; then
        env_file="$2"
        shift 2
    fi

    if [ ! -f "$env_file" ]; then
        print_error "Environment file not found: $env_file"
        return 1
    fi

    print_header "Starting Services with $env_file"
    docker-compose --env-file "$env_file" up -d "$@"
    
    print_success "Services started successfully"
    print_info "Waiting for services to be ready..."
    sleep 5
    
    print_info "Service Status:"
    docker-compose --env-file "$env_file" ps
}

stop_services() {
    print_header "Stopping Services"
    docker-compose down
    print_success "Services stopped"
}

restart_services() {
    print_header "Restarting Services"
    docker-compose restart
    print_success "Services restarted"
}

show_logs() {
    local service="${1:-}"
    
    if [ -z "$service" ]; then
        print_header "Application Logs"
        docker-compose logs -f
    else
        print_header "Logs for $service"
        docker-compose logs -f "$service"
    fi
}

open_shell() {
    local service="${1:-uitutive-app}"
    
    print_info "Opening shell in $service..."
    docker exec -it "$service" sh
}

show_status() {
    print_header "Container Status"
    docker-compose ps
    
    print_header "Resource Usage"
    docker stats --no-stream
}

check_health() {
    print_header "Service Health Check"
    
    # Check application
    if curl -s http://localhost:3000/api/v1 > /dev/null 2>&1; then
        print_success "Application is healthy"
    else
        print_error "Application health check failed"
    fi
    
    # Check Ollama
    if curl -s http://localhost:11434 > /dev/null 2>&1; then
        print_success "Ollama is running"
    else
        print_warning "Ollama is not responding (might not be set up)"
    fi
    
    # Check PostgreSQL
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_success "PostgreSQL is healthy"
    else
        print_warning "PostgreSQL not running or not set up"
    fi
}

setup_ollama() {
    print_header "Setting up Ollama"
    
    if ! docker-compose ps | grep -q ollama; then
        print_error "Ollama container is not running"
        return 1
    fi
    
    print_info "Pulling llama2 model (this may take several minutes)..."
    docker exec ollama-service ollama pull llama2
    
    print_success "Ollama model setup complete"
    print_info "Available models:"
    docker exec ollama-service ollama list
}

clean_resources() {
    print_header "Cleaning Docker Resources"
    
    print_warning "This will remove stopped containers and volumes"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v
        print_success "Cleanup complete"
    else
        print_info "Cleanup cancelled"
    fi
}

deep_clean() {
    print_header "Deep Clean - Removing All Unused Resources"
    
    print_warning "This will remove all stopped containers, unused images, and volumes"
    read -p "Continue? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v --rmi all
        docker system prune -a --volumes -f
        print_success "Deep clean complete"
    else
        print_info "Deep clean cancelled"
    fi
}

# Main script logic
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

case "$1" in
    build)
        build_images "${@:2}"
        ;;
    up)
        start_services "${@:2}"
        ;;
    down)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs "$2"
        ;;
    shell)
        open_shell "$2"
        ;;
    status)
        show_status
        ;;
    health)
        check_health
        ;;
    setup-ollama)
        setup_ollama
        ;;
    clean)
        clean_resources
        ;;
    prune)
        deep_clean
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo "Run './docker-helper.sh help' for usage information"
        exit 1
        ;;
esac
