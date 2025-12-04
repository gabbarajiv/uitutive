# Deployment Guide for Uitutive Docker

This guide covers deploying Uitutive to various cloud and on-premise environments.

## Table of Contents

1. [Local Docker Deployment](#local-docker-deployment)
2. [Docker Hub Deployment](#docker-hub-deployment)
3. [AWS Deployment](#aws-deployment)
4. [Google Cloud Deployment](#google-cloud-deployment)
5. [Azure Deployment](#azure-deployment)
6. [DigitalOcean Deployment](#digitalocean-deployment)
7. [Kubernetes Deployment](#kubernetes-deployment)
8. [Scaling & Optimization](#scaling--optimization)

## Local Docker Deployment

### Prerequisites
- Docker Desktop installed
- Docker Compose version 2.0+
- Minimum 4GB RAM allocated to Docker

### Quick Deploy

```bash
# Copy environment file
cp .env.docker.prod .env

# Build images
docker-compose build

# Start services
docker-compose up -d

# Setup Ollama model
docker exec ollama-service ollama pull llama2

# Verify deployment
docker-compose ps
docker exec uitutive-app curl http://localhost:3000/api/v1
```

## Docker Hub Deployment

### Build and Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Build image with tag
docker build -t yourusername/uitutive:latest .
docker build -t yourusername/uitutive:1.0.0 .

# Push to Docker Hub
docker push yourusername/uitutive:latest
docker push yourusername/uitutive:1.0.0

# Update docker-compose.yml
# Change: build: .
# To: image: yourusername/uitutive:latest
```

### Run from Docker Hub

```bash
docker run -p 3000:3000 -p 4200:4200 \
  -e DB_TYPE=postgres \
  -e POSTGRES_HOST=<host> \
  yourusername/uitutive:latest
```

## AWS Deployment

### Option 1: EC2 with Docker

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@<instance-ip>

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone repository
git clone <your-repo> uitutive
cd uitutive

# Start application
docker-compose --env-file .env.docker.prod up -d
```

### Option 2: AWS ECS (Elastic Container Service)

```bash
# Install AWS CLI
pip install awscli

# Login to AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and tag image
docker build -t uitutive:latest .
docker tag uitutive:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/uitutive:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/uitutive:latest

# Create ECS task definition using AWS Console or CLI
# Reference: docker-compose.yml for service configuration
```

### Option 3: AWS Lightsail

```bash
# Create container service
aws lightsail create-container-service \
  --service-name uitutive \
  --power medium \
  --scale 2

# Deploy container
aws lightsail create-container-service-deployment \
  --service-name uitutive \
  --containers '[{"image":"uitutive:latest","ports":{"3000":"HTTP"}}]' \
  --public-endpoint-enabled
```

## Google Cloud Deployment

### Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/<project-id>/uitutive

# Deploy to Cloud Run
gcloud run deploy uitutive \
  --image gcr.io/<project-id>/uitutive \
  --platform managed \
  --region us-central1 \
  --port 3000 \
  --set-env-vars NODE_ENV=production,DB_TYPE=postgres
```

### Google Kubernetes Engine (GKE)

```bash
# Create cluster
gcloud container clusters create uitutive-cluster \
  --zone us-central1-a \
  --num-nodes 3

# Push image to registry
gcloud builds submit --tag gcr.io/<project-id>/uitutive

# Create deployment
kubectl apply -f k8s/deployment.yaml

# Expose service
kubectl expose deployment uitutive \
  --type=LoadBalancer \
  --port=80 \
  --target-port=3000
```

## Azure Deployment

### Azure Container Instances (ACI)

```bash
# Login to Azure
az login

# Create container registry
az acr create --resource-group myResourceGroup \
  --name uitutive --sku Basic

# Build and push image
az acr build --registry uitutive \
  --image uitutive:latest .

# Create container instance
az container create \
  --resource-group myResourceGroup \
  --name uitutive-app \
  --image uitutive.azurecr.io/uitutive:latest \
  --registry-login-server uitutive.azurecr.io \
  --ports 3000 4200 \
  --environment-variables NODE_ENV=production
```

### Azure App Service

```bash
# Create App Service plan
az appservice plan create \
  --name uitutive-plan \
  --resource-group myResourceGroup \
  --sku B1 --is-linux

# Create web app
az webapp create \
  --resource-group myResourceGroup \
  --plan uitutive-plan \
  --name uitutive-app \
  --deployment-container-image-name uitutive.azurecr.io/uitutive:latest
```

## DigitalOcean Deployment

### Using App Platform

```bash
# Create app.yaml
cat > app.yaml << 'EOF'
name: uitutive
services:
- name: api
  source:
    type: github
    repo: yourusername/uitutive
    branch: main
  build_command: npm run build:all
  run_command: npm run backend:start
  http_port: 3000
databases:
- name: postgres
  engine: PG
  version: "15"
EOF

# Deploy
doctl apps create --spec app.yaml

# Or use DigitalOcean App Platform dashboard
```

### Using Droplet with Docker

```bash
# Create Droplet with Docker pre-installed
# SSH into droplet
ssh root@<droplet-ip>

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Deploy
git clone <your-repo> uitutive
cd uitutive
docker-compose --env-file .env.docker.prod up -d
```

## Kubernetes Deployment

### Generate Kubernetes Manifests

```bash
# Install Kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.28.0/kompose-linux-amd64 -o kompose
chmod +x kompose

# Convert Docker Compose to Kubernetes
./kompose convert -f docker-compose.yml -o k8s/
```

### Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace uitutive

# Apply manifests
kubectl apply -f k8s/ --namespace uitutive

# Expose service
kubectl expose deployment uitutive \
  --type=LoadBalancer \
  --port=80 \
  --target-port=3000 \
  --namespace uitutive

# Check status
kubectl get pods --namespace uitutive
kubectl get svc --namespace uitutive
```

### Deploy with Helm

```bash
# Create Helm chart structure
helm create uitutive

# Update Chart.yaml with app details
# Edit values.yaml for configuration

# Deploy
helm install uitutive ./uitutive \
  --namespace uitutive \
  --create-namespace

# Check deployment
helm status uitutive --namespace uitutive
```

## Scaling & Optimization

### Horizontal Scaling (Multiple Containers)

```yaml
# docker-compose.yml
services:
  uitutive:
    # ... existing config
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

### Load Balancing with Nginx

```bash
# docker-compose.yml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - uitutive

  uitutive:
    # ... existing config
    # Remove ports mapping, use internal networking
```

### Database Replication

```bash
# Use managed database service (AWS RDS, Google Cloud SQL, etc.)
# Configure connection pooling
# Enable read replicas for scaling
```

### Caching Layer

```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

## Monitoring & Logging

### Docker Compose with Monitoring

```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

  # Application with metrics
  uitutive:
    # ... existing config
    environment:
      - ENABLE_METRICS=true
```

### Centralized Logging

```bash
# Using ELK Stack (Elasticsearch, Logstash, Kibana)
docker-compose -f docker-compose.elk.yml up -d

# Application sends logs to ELK
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker image
        run: docker build -t ghcr.io/yourusername/uitutive:latest .
      
      - name: Push to registry
        run: docker push ghcr.io/yourusername/uitutive:latest
      
      - name: Deploy to server
        run: |
          ssh user@server "cd uitutive && git pull && docker-compose up -d"
```

## Security Best Practices

1. **Use Environment Variables**: Never hardcode secrets
2. **Run as Non-root**: Use `USER` directive in Dockerfile
3. **Minimal Base Images**: Use Alpine Linux
4. **Scan Images**: `docker scan yourusername/uitutive`
5. **Network Policies**: Use private networks
6. **Secrets Management**: Use cloud provider secret managers
7. **HTTPS**: Use reverse proxy with SSL/TLS
8. **Regular Updates**: Keep base images and dependencies updated

## Troubleshooting Deployment

### Common Issues

1. **Port Already in Use**
   ```bash
   docker ps
   docker kill <container-id>
   ```

2. **Database Connection Failed**
   ```bash
   docker-compose logs postgres
   docker-compose exec postgres psql -U postgres -d uitutive
   ```

3. **Out of Memory**
   ```bash
   docker stats
   docker system prune -a
   ```

4. **Container Exit**
   ```bash
   docker-compose logs uitutive
   docker-compose ps
   ```

## Performance Checklist

- [ ] Set resource limits
- [ ] Enable caching
- [ ] Use CDN for static assets
- [ ] Optimize database queries
- [ ] Configure connection pooling
- [ ] Enable gzip compression
- [ ] Use production database
- [ ] Configure monitoring
- [ ] Setup automated backups
- [ ] Test disaster recovery

---

For more information:
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
