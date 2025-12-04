# Docker Deployment Checklist

Complete checklist for deploying Uitutive using Docker.

## Pre-Deployment

### System Requirements
- [ ] Docker installed (version 20.10+)
- [ ] Docker Compose installed (version 2.0+)
- [ ] Minimum 4GB RAM available
- [ ] Minimum 10GB disk space available
- [ ] Port 3000 available (or configure different port)
- [ ] Port 4200 available for frontend testing
- [ ] Port 11434 available for Ollama

### Project Setup
- [ ] Source code cloned/ready
- [ ] All package.json dependencies reviewed
- [ ] Environment files reviewed (.env.docker, .env.docker.dev, .env.docker.prod)
- [ ] Database type decided (SQLite for dev, PostgreSQL for prod)
- [ ] CORS origin configured for target domain

## Build Phase

### Building Images
- [ ] Run: `docker-compose build`
- [ ] Check for build errors
- [ ] Verify image size reasonable
- [ ] Tag images appropriately
- [ ] Push to registry if using (Docker Hub, ECR, etc.)

### Local Testing
- [ ] Test: `docker-compose up -d`
- [ ] Check: `docker-compose ps` - all running
- [ ] Check: `docker-compose logs` - no errors
- [ ] Verify health: `curl http://localhost:3000/api/v1`
- [ ] Test database connection
- [ ] Test: `docker-compose down`

## Configuration

### Environment Setup
- [ ] Copy appropriate .env file: `cp .env.docker.prod .env`
- [ ] Review all environment variables
- [ ] Update sensitive values (passwords, API keys)
- [ ] Set correct database connection string
- [ ] Configure CORS_ORIGIN for domain
- [ ] Set NODE_ENV appropriately
- [ ] Document all custom settings

### Database Configuration
**If using SQLite:**
- [ ] Ensure `./data` directory exists and is writable
- [ ] Verify SQLITE_PATH is correct
- [ ] Check disk space for database growth
- [ ] Plan backup strategy

**If using PostgreSQL:**
- [ ] Change default POSTGRES_PASSWORD
- [ ] Configure POSTGRES_USER appropriately
- [ ] Set POSTGRES_DB name
- [ ] Verify PostgreSQL container starts
- [ ] Test database connection
- [ ] Enable PostgreSQL profile in docker-compose
- [ ] Plan backup strategy
- [ ] Configure connection pooling

### Ollama Setup
- [ ] Start Ollama service
- [ ] Pull required model: `docker exec ollama-service ollama pull llama2`
- [ ] Wait for model to download completely
- [ ] Verify model availability: `docker exec ollama-service ollama list`
- [ ] Test Ollama endpoint: `curl http://localhost:11434`

## Deployment

### Start Services
- [ ] Run: `docker-compose up -d`
- [ ] Monitor: `docker-compose logs -f` (10-15 seconds)
- [ ] Check: `docker-compose ps` - all healthy
- [ ] Wait for health checks to pass

### Verify Services
- [ ] Frontend accessible: http://localhost:4200
- [ ] Backend responding: curl http://localhost:3000/api/v1
- [ ] Database operational: check logs
- [ ] Ollama working: curl http://localhost:11434
- [ ] No error logs in output
- [ ] Health checks passing

### Application Testing
- [ ] Load frontend in browser
- [ ] Test form creation functionality
- [ ] Test form submission
- [ ] Test AI features (if Ollama available)
- [ ] Test response storage
- [ ] Check browser console for errors
- [ ] Test API endpoints with Postman/curl
- [ ] Verify CORS headers correct

### Performance Check
- [ ] Run: `docker stats`
- [ ] Memory usage acceptable
- [ ] CPU usage reasonable
- [ ] No memory leaks over time
- [ ] Response times acceptable

## Data Management

### Backup Planning
- [ ] Identify backup strategy
- [ ] Configure automated backups
- [ ] Test restore procedure
- [ ] Document backup process

### Volume Management
- [ ] Verify volume mounts created
- [ ] Check volume permissions
- [ ] Verify data persistence
- [ ] Test data survives container restart

### Cleanup
- [ ] Remove test/temporary data
- [ ] Clean up logs if needed
- [ ] Verify only necessary files present

## Security

### Pre-Deployment Security
- [ ] Remove hardcoded secrets
- [ ] Use environment variables for all sensitive data
- [ ] Update .gitignore to exclude .env files
- [ ] Verify no secrets in logs
- [ ] Set proper file permissions

### Runtime Security
- [ ] Run containers as non-root (if possible)
- [ ] Restrict volume permissions
- [ ] Use internal network for services
- [ ] Configure firewall rules
- [ ] Only expose necessary ports
- [ ] Disable debug mode in production
- [ ] Enable SSL/TLS if possible

### Image Security
- [ ] Scan images for vulnerabilities: `docker scan`
- [ ] Use minimal base images
- [ ] Keep base images updated
- [ ] Remove unnecessary packages
- [ ] Use specific image versions, not latest

## Monitoring & Logging

### Monitoring Setup
- [ ] Configure container monitoring
- [ ] Set up CPU/memory alerts
- [ ] Set up disk space alerts
- [ ] Set up health check monitoring
- [ ] Configure log aggregation (optional)

### Logging
- [ ] Verify logs accessible: `docker-compose logs`
- [ ] Configure log rotation if needed
- [ ] Set up centralized logging (optional)
- [ ] Create log retention policy

## Production Deployment

### Pre-Production
- [ ] Run load tests
- [ ] Test failover/recovery
- [ ] Test backup/restore
- [ ] Performance benchmark
- [ ] Security audit

### Production Deployment
- [ ] Schedule maintenance window
- [ ] Notify stakeholders
- [ ] Deploy to production
- [ ] Monitor continuously
- [ ] Verify all functionality
- [ ] Document any issues

### Post-Deployment
- [ ] Verify all services running
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify backups running
- [ ] Update documentation
- [ ] Communicate status to team

## Ongoing Maintenance

### Daily
- [ ] Check container health: `docker-compose ps`
- [ ] Monitor logs for errors
- [ ] Check disk space: `df -h`
- [ ] Verify application accessible

### Weekly
- [ ] Review resource usage: `docker stats`
- [ ] Check for security updates
- [ ] Verify backups completed
- [ ] Test recovery procedure

### Monthly
- [ ] Review and rotate logs
- [ ] Update base images
- [ ] Security audit
- [ ] Performance review
- [ ] Capacity planning

### Quarterly
- [ ] Major security updates
- [ ] Dependency updates
- [ ] Disaster recovery testing
- [ ] Architecture review

## Scaling

### Monitor for Scaling Needs
- [ ] Track CPU usage over time
- [ ] Track memory usage over time
- [ ] Track disk usage over time
- [ ] Monitor response times
- [ ] Track error rates

### Scale When Needed
- [ ] Add additional application instances
- [ ] Scale database (read replicas, etc.)
- [ ] Add caching layer (Redis)
- [ ] Configure load balancer
- [ ] Optimize database queries

## Troubleshooting Checklist

### If Services Won't Start
- [ ] Check logs: `docker-compose logs`
- [ ] Verify ports available: `netstat -ano` (Windows)
- [ ] Check environment variables
- [ ] Verify volumes accessible
- [ ] Check disk space
- [ ] Rebuild images: `docker-compose build --no-cache`

### If Database Connection Fails
- [ ] Check database container running
- [ ] Verify connection string
- [ ] Check database logs
- [ ] Verify network connectivity
- [ ] Test with psql/sqlite3 client

### If Ollama Not Working
- [ ] Check Ollama container running
- [ ] Verify model pulled: `docker exec ollama-service ollama list`
- [ ] Check Ollama logs
- [ ] Test endpoint: `curl http://localhost:11434`
- [ ] Verify network connectivity

### If Application Slow
- [ ] Check resource usage: `docker stats`
- [ ] Review logs for errors
- [ ] Check database performance
- [ ] Monitor API response times
- [ ] Check disk I/O

## Documentation

### Update Documentation
- [ ] Update deployment guide with custom settings
- [ ] Document environment-specific configurations
- [ ] Create runbook for common operations
- [ ] Document troubleshooting steps taken
- [ ] Update security policies
- [ ] Create disaster recovery plan

### Team Knowledge
- [ ] Train team on Docker commands
- [ ] Share helper scripts usage
- [ ] Document access procedures
- [ ] Share monitoring dashboards
- [ ] Establish on-call procedures

## Sign-Off

- [ ] All tests passed
- [ ] All health checks passing
- [ ] Performance acceptable
- [ ] Security audit complete
- [ ] Documentation complete
- [ ] Team trained
- [ ] Approved for production

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Approved By**: _______________  

---

## Quick Reference

### Emergency Restart
```bash
docker-compose down
docker-compose up -d
```

### Emergency Stop
```bash
docker-compose down
```

### View All Logs
```bash
docker-compose logs -f
```

### Get Container Shell
```bash
docker exec -it uitutive-app sh
```

### System Resources
```bash
docker stats
```

### Clean Everything
```bash
docker-compose down -v
docker system prune -a
```

---

**Last Updated**: December 2024
**Checklist Version**: 1.0.0
