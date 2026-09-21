This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## 在服务器运行：
```bash
cd /srv/dongyuanlihua-web

set -a
source .env.production
set +a

npm run build
npm run start -- -p 3000

```

### 看到类似 Ready 后，访问：
http://服务器IP:3000
确认正常后，用 systemd 保持后台运行：

```bash

sudo systemctl enable --now dongyuanlihua
sudo systemctl restart dongyuanlihua
sudo systemctl status dongyuanlihua

```

### 查看实时日志：
sudo journalctl -u dongyuanlihua -f

### 每次更新代码后的标准流程：

```bash
cd /srv/dongyuanlihua-web
git pull
npm ci
npm run build
sudo systemctl restart dongyuanlihua

```