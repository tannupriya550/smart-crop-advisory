# Overview

CropAdvisor is a comprehensive agricultural advisory application built as a full-stack web application. It provides farmers with personalized crop recommendations, pest and disease identification, fertilizer calculations, weather information, and AI-powered assistance. The application supports multiple Indian languages and is designed to be mobile-first with a responsive design.

The application consists of a React frontend with TypeScript, an Express.js backend, and uses PostgreSQL with Drizzle ORM for data persistence. It integrates OpenAI for AI-powered chat assistance and features a modern UI built with shadcn/ui components and Tailwind CSS.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React Query (TanStack Query) for server state, React Context for local state
- **Build Tool**: Vite with hot module replacement

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API with structured error handling
- **Authentication**: Session-based (infrastructure in place via connect-pg-simple)

## Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations
- **Local Storage**: Browser localStorage for user preferences and offline data
- **In-Memory Storage**: Fallback storage implementation for development

## Core Data Models
- **Farm Profiles**: Farmer information, location, farm size, soil type, irrigation methods
- **Crop Recommendations**: AI-generated crop suggestions with match percentages and income estimates
- **Chat Messages**: Conversation history with AI assistant
- **Pest/Disease Data**: Static database of pest identification and treatment information

## Authentication and Authorization
- Session-based authentication using connect-pg-simple for PostgreSQL session storage
- No user registration system currently implemented (profile-based approach)
- Farm profile acts as user identification mechanism

## AI Integration
- **OpenAI Integration**: GPT-5 model for agricultural advice and chat assistance
- **Multilingual Support**: AI responses in multiple Indian languages (Hindi, Telugu, Tamil, Bengali, English)
- **Contextual Assistance**: Farm profile integration for personalized recommendations

## Mobile-First Design
- **Responsive Layout**: Mobile-first approach with desktop adaptations
- **Bottom Navigation**: Mobile-friendly navigation pattern
- **Touch-Optimized**: Large touch targets and mobile-friendly interactions
- **PWA-Ready**: Service worker and offline capabilities structure in place

## Internationalization
- **Multi-language Support**: Hindi, English, Telugu, Tamil, Bengali
- **Translation System**: Custom translation context with localStorage persistence
- **Localized Content**: Dynamic content translation for UI elements

## Development Features
- **Hot Reload**: Vite development server with HMR
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Code Quality**: ESLint and TypeScript strict mode
- **Path Mapping**: Alias-based imports for clean code organization

# External Dependencies

## Database and Storage
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations and migrations
- **connect-pg-simple**: PostgreSQL session store for Express

## AI and Machine Learning
- **OpenAI API**: GPT-5 model for agricultural advice and chat functionality
- **Agricultural Data**: Static crop and pest databases for recommendations

## UI and Styling
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Consistent icon library
- **shadcn/ui**: Pre-built component library

## Development and Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and enhanced developer experience
- **React Query**: Server state management and caching
- **React Hook Form**: Form validation and management

## Additional Services
- **Weather API**: (Structure in place for weather data integration)
- **Image Processing**: (Infrastructure for pest identification via photos)
- **Voice Input**: (Planned feature for multilingual voice commands)

The application is designed to be easily deployable on platforms like Replit with environment-based configuration and supports both development and production modes with appropriate optimizations.