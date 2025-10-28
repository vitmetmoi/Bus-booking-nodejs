# SmartBus Vivutoday 

## Introduction

Vivutoday national bus ticket booking system is developed with specific goals to meet the needs of both customers and bus operators, while promoting the development of the passenger transport industry in Vietnam.

## Member

- [Nguyen Duc Anh](https://git.rikkei.edu.vn/anhnguyen) (Leader)
- [Vu Ha Trang](https://git.rikkei.edu.vn/trangvux)
- [Tran Lan](https://git.rikkei.edu.vn/tranlan149)
- [Dao Anh Son](https://git.rikkei.edu.vn/daoanhson1998)
- [Nguyen Tuan](https://git.rikkei.edu.vn/tuannguyen2705)
- [Nguyen Huy](https://git.rikkei.edu.vn/HuyNguyen)

## Getting Started

### Step-by-Step Guide

#### Step 1: Initial Setup

- Clone the repository: `git clone https://git.rikkei.edu.vn/ojt-phenikaa/group03/api.git`
- Navigate: `cd api`
- Install `pnpm` globally: `npm install -g pnpm`
- Check installed version : `pnpm -version`
- Install dependencies: `pnpm install`

#### Step 2: Environment Configuration

- Create `.env`: Copy `.env.template` to `.env`
- Update `.env`: Fill in necessary environment variables

#### Step 3: Running the Project

- Development Mode: `pnpm start:dev`
- Building: `pnpm build`
- Production Mode: Set `NODE_ENV="production"` in `.env` then `pnpm build && pnpm start:prod`

## Folder Structure

```code
├── biome.json
├── Dockerfile
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── README.md
├── src
│   ├── api
│   │   ├── healthCheck
│   │   │   ├── __tests__
│   │   │   │   └── healthCheckRouter.test.ts
│   │   │   └── healthCheckRouter.ts
│   │   └── user
│   │       ├── __tests__
│   │       │   ├── userRouter.test.ts
│   │       │   └── userService.test.ts
│   │       ├── userController.ts
│   │       ├── userModel.ts
│   │       ├── userRepository.ts
│   │       ├── userRouter.ts
│   │       └── userService.ts
│   ├── api-docs
│   │   ├── __tests__
│   │   │   └── openAPIRouter.test.ts
│   │   ├── openAPIDocumentGenerator.ts
│   │   ├── openAPIResponseBuilders.ts
│   │   └── openAPIRouter.ts
│   ├── common
│   │   ├── __tests__
│   │   │   ├── errorHandler.test.ts
│   │   │   └── requestLogger.test.ts
│   │   ├── middleware
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── requestLogger.ts
│   │   ├── models
│   │   │   └── serviceResponse.ts
│   │   └── utils
│   │       ├── commonValidation.ts
│   │       ├── envConfig.ts
│   │       └── httpHandlers.ts
│   ├── index.ts
│   └── server.ts
├── tsconfig.json
└── vite.config.mts
```
