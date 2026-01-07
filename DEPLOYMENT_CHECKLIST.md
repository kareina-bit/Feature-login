# ✅ Deployment Checklist - Shipway

Checklist này giúp đảm bảo dự án Shipway sẵn sàng cho production.

## 📋 Pre-Deployment Checklist

### 🔐 Security

- [ ] **Environment Variables**
  - [ ] `.env` không được commit vào git
  - [ ] `.env.template` đã được tạo
  - [ ] Tất cả secrets đã được set trong production environment
  - [ ] `JWT_SECRET` >= 32 ký tự, random, unique
  - [ ] `ADMIN_PASSWORD` đã được thay đổi (không dùng default)

- [ ] **Database**
  - [ ] MongoDB Atlas Network Access đã được cấu hình đúng
  - [ ] Chỉ whitelist IP của production server (không dùng 0.0.0.0/0)
  - [ ] Database user có quyền phù hợp (readWrite, không phải admin)
  - [ ] Connection string không chứa plaintext password trong code

- [ ] **API Security**
  - [ ] CORS chỉ allow production domain
  - [ ] Rate limiting đã được implement (nếu có)
  - [ ] Input validation hoạt động đúng
  - [ ] Error messages không leak sensitive info

### 🗄️ Database

- [ ] **MongoDB Atlas**
  - [ ] Cluster đã được tạo và running
  - [ ] Database `shipway` tồn tại
  - [ ] Collections `users` và `otps` đã được tạo
  - [ ] Indexes đã được tạo đúng
  - [ ] TTL index cho `otps` collection hoạt động
  - [ ] Admin account đã được seed
  - [ ] Backup schedule đã được setup (paid tier)

- [ ] **Data**
  - [ ] Admin password đã được thay đổi
  - [ ] Test data đã được xóa (nếu có)
  - [ ] Production data đã được verify

### 🔧 Backend

- [ ] **Code**
  - [ ] Tất cả dependencies đã được install
  - [ ] `NODE_ENV=production` trong .env
  - [ ] Không có console.log không cần thiết
  - [ ] Error handling hoạt động đúng
  - [ ] Logging đã được setup (nếu cần)

- [ ] **Configuration**
  - [ ] `PORT` đúng với server config
  - [ ] `FRONTEND_URL` trỏ đến production domain
  - [ ] `MONGODB_URI` trỏ đến production database
  - [ ] Twilio credentials (nếu dùng SMS thật)

- [ ] **Testing**
  - [ ] Tất cả API endpoints đã được test
  - [ ] Authentication flow hoạt động
  - [ ] OTP system hoạt động
  - [ ] Role-based access control hoạt động
  - [ ] Error cases đã được test

### 💻 Frontend

- [ ] **Code**
  - [ ] `BASE_URL` trong `config/env.js` trỏ đến production API
  - [ ] Không có hardcoded URLs
  - [ ] Console logs đã được xóa/comment
  - [ ] Error handling hoạt động

- [ ] **Assets**
  - [ ] Images đã được optimize
  - [ ] CSS đã được minify (nếu cần)
  - [ ] JS đã được minify (nếu cần)

- [ ] **Testing**
  - [ ] Login flow hoạt động
  - [ ] Register flow hoạt động
  - [ ] Reset password flow hoạt động
  - [ ] UI responsive trên mobile
  - [ ] Cross-browser testing (Chrome, Firefox, Safari)

### 📱 OTP System

- [ ] **Twilio** (nếu dùng SMS thật)
  - [ ] Account đã được verify
  - [ ] Phone number đã được mua/verify
  - [ ] Credits đủ để gửi SMS
  - [ ] Test SMS đã được gửi thành công
  - [ ] Credentials đã được set trong .env

- [ ] **Development Mode** (nếu không dùng Twilio)
  - [ ] OTP hiển thị trong console/response
  - [ ] Users biết cách lấy OTP
  - [ ] Documentation đã note rõ

### 📚 Documentation

- [ ] **README Files**
  - [ ] Main README.md đã update
  - [ ] Backend README.md đầy đủ
  - [ ] Frontend README.md đầy đủ
  - [ ] API documentation đầy đủ

- [ ] **Setup Guides**
  - [ ] QUICKSTART.md đã test
  - [ ] SETUP_INSTRUCTIONS.md đã test
  - [ ] MONGODB_ATLAS_SETUP.md đã test

- [ ] **Other Docs**
  - [ ] BACKEND_DOCUMENTATION.md đầy đủ
  - [ ] API_EXAMPLES.md đầy đủ
  - [ ] CHANGELOG.md đã update

## 🚀 Deployment Steps

### Backend Deployment

#### Option 1: VPS (Ubuntu)

- [ ] **Server Setup**
  - [ ] Node.js 18.x đã được install
  - [ ] PM2 đã được install globally
  - [ ] Git đã được install
  - [ ] Nginx đã được install (nếu cần)

- [ ] **Deploy Code**
  - [ ] Code đã được clone/upload
  - [ ] `npm install --production` đã chạy
  - [ ] `.env` đã được tạo với production values
  - [ ] `npm run seed` đã chạy (lần đầu)

- [ ] **PM2**
  - [ ] `pm2 start server.js --name shipway-api`
  - [ ] `pm2 startup` đã chạy
  - [ ] `pm2 save` đã chạy
  - [ ] PM2 logs hoạt động: `pm2 logs shipway-api`

- [ ] **Nginx** (nếu dùng)
  - [ ] Config file đã được tạo
  - [ ] Reverse proxy đã được setup
  - [ ] SSL certificate đã được install (Let's Encrypt)
  - [ ] Nginx restart thành công

- [ ] **Firewall**
  - [ ] Port 80, 443 đã được mở
  - [ ] Port 5000 chỉ allow localhost (nếu dùng Nginx)

#### Option 2: Heroku

- [ ] Heroku CLI đã được install
- [ ] App đã được tạo: `heroku create shipway-api`
- [ ] Environment variables đã được set:
  ```bash
  heroku config:set MONGODB_URI=...
  heroku config:set JWT_SECRET=...
  heroku config:set NODE_ENV=production
  # ... all other vars
  ```
- [ ] Code đã được push: `git push heroku main`
- [ ] Seed đã chạy: `heroku run npm run seed`
- [ ] Logs hoạt động: `heroku logs --tail`

#### Option 3: Docker

- [ ] Dockerfile đã được tạo
- [ ] docker-compose.yml đã được tạo
- [ ] Image đã được build: `docker build -t shipway-api .`
- [ ] Container đã chạy: `docker-compose up -d`
- [ ] Logs hoạt động: `docker logs <container_id>`

### Frontend Deployment

#### Option 1: Netlify

- [ ] Netlify CLI đã được install
- [ ] Site đã được tạo
- [ ] `frontend/` folder đã được deploy
- [ ] Environment variables đã được set (nếu cần)
- [ ] Custom domain đã được setup (nếu có)
- [ ] SSL certificate active

#### Option 2: Vercel

- [ ] Vercel CLI đã được install
- [ ] Project đã được tạo
- [ ] Deploy: `vercel --prod`
- [ ] Environment variables đã được set
- [ ] Custom domain đã được setup (nếu có)

#### Option 3: VPS (Nginx)

- [ ] Files đã được upload vào `/var/www/shipway/frontend`
- [ ] Nginx config đã được tạo
- [ ] Domain đã được point đến server
- [ ] SSL certificate đã được install
- [ ] Nginx restart thành công

## ✅ Post-Deployment Checklist

### Testing

- [ ] **Backend**
  - [ ] Health check: `curl https://api.shipway.vn/api/health`
  - [ ] Login với admin account
  - [ ] Register user mới
  - [ ] Send OTP hoạt động
  - [ ] Reset password hoạt động

- [ ] **Frontend**
  - [ ] Website accessible: `https://shipway.vn`
  - [ ] Login page load
  - [ ] Register page load
  - [ ] API calls hoạt động
  - [ ] OTP notification hiển thị (nếu dev mode)

- [ ] **Integration**
  - [ ] Frontend kết nối được Backend
  - [ ] Authentication flow hoạt động end-to-end
  - [ ] Token được lưu đúng
  - [ ] Redirect hoạt động

### Monitoring

- [ ] **Backend**
  - [ ] Server logs hoạt động
  - [ ] PM2 monitoring: `pm2 monit`
  - [ ] Error tracking setup (nếu có)
  - [ ] Uptime monitoring (nếu có)

- [ ] **Database**
  - [ ] MongoDB Atlas metrics
  - [ ] Connection count
  - [ ] Storage usage
  - [ ] Alerts setup

- [ ] **Frontend**
  - [ ] Analytics setup (nếu có)
  - [ ] Error tracking (nếu có)

### Security

- [ ] **SSL/HTTPS**
  - [ ] Backend API có HTTPS
  - [ ] Frontend có HTTPS
  - [ ] Certificates valid và không expired

- [ ] **Headers**
  - [ ] Security headers đã được set (nếu có)
  - [ ] CORS headers đúng

- [ ] **Credentials**
  - [ ] Admin password đã thay đổi
  - [ ] Database password mạnh
  - [ ] JWT secret unique và random

### Backup

- [ ] **Database**
  - [ ] Backup schedule active (paid tier)
  - [ ] Manual backup đã được tạo
  - [ ] Restore process đã được test

- [ ] **Code**
  - [ ] Git repository up-to-date
  - [ ] Tags/releases đã được tạo

### Documentation

- [ ] **Update Docs**
  - [ ] Production URLs trong docs
  - [ ] API base URL updated
  - [ ] Deployment notes added

- [ ] **Team**
  - [ ] Team biết cách access production
  - [ ] Credentials đã được share securely
  - [ ] On-call rotation setup (nếu cần)

## 🔄 Maintenance Checklist

### Daily

- [ ] Check server uptime
- [ ] Check error logs
- [ ] Monitor database size

### Weekly

- [ ] Review MongoDB Atlas metrics
- [ ] Check OTP delivery rate
- [ ] Review user registrations

### Monthly

- [ ] Update dependencies (security patches)
- [ ] Review and rotate credentials
- [ ] Database cleanup (old OTPs, inactive users)
- [ ] Backup verification

## 🆘 Rollback Plan

### If deployment fails:

1. **Backend**
   - [ ] Stop PM2: `pm2 stop shipway-api`
   - [ ] Revert code: `git checkout <previous-commit>`
   - [ ] Restart: `pm2 restart shipway-api`

2. **Frontend**
   - [ ] Revert to previous deployment
   - [ ] Clear CDN cache (nếu có)

3. **Database**
   - [ ] Restore from backup (nếu cần)
   - [ ] Verify data integrity

## 📞 Emergency Contacts

- **DevOps**: [Contact info]
- **Database Admin**: [Contact info]
- **On-call**: [Contact info]

## 📊 Success Metrics

Sau deployment, verify:

- [ ] API response time < 500ms
- [ ] Frontend load time < 3s
- [ ] OTP delivery rate > 95%
- [ ] Error rate < 1%
- [ ] Uptime > 99.9%

## 🎉 Launch!

Khi tất cả checklist đã hoàn thành:

- [ ] Announce launch to team
- [ ] Monitor closely for first 24h
- [ ] Collect user feedback
- [ ] Plan next iteration

---

**Version**: 1.0.0  
**Last Updated**: January 4, 2025  
**Status**: Ready for Production ✅

