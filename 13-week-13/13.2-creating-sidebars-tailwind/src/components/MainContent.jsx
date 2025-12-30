/*
  ===========================================
  MainContent.jsx - Dashboard Main Content Area
  ===========================================
  
  Layout matches reference screenshot:
  - Floating user profile card (like Twitter/LinkedIn)
  - Greeting section
  - Content grid (schedule + action buttons)
  
  KEY CONCEPTS:
  1. useState for toggling profile card visibility
  2. Absolute/relative positioning for floating card
  3. z-index for layering
*/

import { useState } from 'react';

/*
  Mock data for meetings
*/
const meetings = [
    { id: 1, time: '11:30 AM', title: 'UX Webinar', status: 'live' },
    { id: 2, time: '11:30 AM', title: 'My first Webinar', status: 'upcoming' },
    { id: 3, time: '11:30 AM', title: 'Important Webinar', status: 'upcoming' },
    { id: 4, time: '11:30 AM', title: 'Webinar 1', status: 'upcoming' },
];

/*
  User data (in real app, this comes from auth/API)
*/
const userData = {
    name: 'Prabhleen Kaur',
    email: 'prabhleen@gmail.com',
    phone: '9899999882',
    location: 'Delhi, India',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
};

function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 18) return 'Good afternoon';
    return 'Good evening';
}

function getFormattedDate() {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
}

export function MainContent() {
    /*
      State to control whether the profile card is visible.
      In the reference, it appears to be shown by default or on avatar click.
    */
    const [showProfile, setShowProfile] = useState(true);

    return (
        <main className="flex-1 min-h-screen bg-content-bg transition-colors duration-300 relative">

            {/* 
        ===========================================
        FLOATING USER PROFILE CARD
        ===========================================
        
        This card floats above the content, positioned absolutely.
        Like Twitter/LinkedIn profile cards.
        
        POSITIONING CONCEPTS:
        - absolute: Removed from normal flow, positioned relative to nearest positioned ancestor
        - top-8 left-8: 32px from top and left (after sidebar)
        - z-20: Above other content
      */}
            {showProfile && (
                <div className="
          absolute top-8 left-8 z-20
          w-56
          bg-card-bg
          rounded-xl
          shadow-xl
          border border-border
          p-6
          transition-colors duration-300
        ">
                    {/* Close button */}
                    <button
                        onClick={() => setShowProfile(false)}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-border transition-colors"
                    >
                        <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* User avatar */}
                    <div className="flex justify-center mb-4">
                        <img
                            src={userData.avatar}
                            alt={userData.name}
                            className="w-20 h-20 rounded-full object-cover border-4 border-border"
                        />
                    </div>

                    {/* User info */}
                    <div className="text-center">
                        <h3 className="font-bold text-text-primary transition-colors duration-300">{userData.name}</h3>
                        <p className="text-sm text-text-secondary mt-1 transition-colors duration-300">{userData.email}</p>
                        <p className="text-sm text-text-secondary transition-colors duration-300">{userData.phone}</p>
                        <p className="text-sm text-text-muted mt-2 transition-colors duration-300">{userData.location}</p>
                    </div>
                </div>
            )}

            {/* 
        Small avatar button to reopen profile card when closed
      */}
            {!showProfile && (
                <button
                    onClick={() => setShowProfile(true)}
                    className="
            absolute top-4 left-4 z-20
            w-10 h-10
            rounded-full
            overflow-hidden
            border-2 border-border
            hover:border-primary
            transition-colors
          "
                >
                    <img src={userData.avatar} alt={userData.name} className="w-full h-full object-cover" />
                </button>
            )}

            {/* 
        ===========================================
        MAIN CONTENT BODY
        ===========================================
        
        Padding on left is larger to make room for the floating card.
      */}
            <div className="p-8 pl-72">
                {/* Greeting section */}
                <div className="mb-8">
                    <p className="text-text-secondary text-sm mb-1 transition-colors duration-300">
                        {getFormattedDate()}
                    </p>
                    <h1 className="text-3xl font-bold text-text-primary transition-colors duration-300">
                        {getGreeting()}, {userData.name.split(' ')[0]}! 👋
                    </h1>
                </div>

                {/* Content grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Schedule card - 2 columns */}
                    <div className="lg:col-span-2 bg-card-bg rounded-xl shadow-sm border border-border p-6 transition-colors duration-300">
                        {/* Card header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="font-medium text-text-primary transition-colors duration-300">
                                    Monday, 14 October 2024
                                </span>
                                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {/* Nav arrows */}
                            <div className="flex gap-2">
                                <button className="p-1 rounded hover:bg-border transition-colors">
                                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button className="p-1 rounded hover:bg-border transition-colors">
                                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Meetings list */}
                        <div className="space-y-4">
                            {meetings.map((meeting) => (
                                <div
                                    key={meeting.id}
                                    className="flex items-center gap-4 py-3 border-b border-border last:border-0"
                                >
                                    {/* Time */}
                                    <div className="w-20">
                                        <p className="font-semibold text-text-primary transition-colors duration-300">{meeting.time}</p>
                                        <p className="text-xs text-text-muted transition-colors duration-300">{meeting.time}</p>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-px h-10 bg-border"></div>

                                    {/* Status + Title */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`
                        px-2 py-0.5 rounded text-xs font-medium
                        ${meeting.status === 'live'
                                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                }
                      `}>
                                                {meeting.status === 'live' ? 'Live 🔴' : 'Upcoming 🔵'}
                                            </span>
                                        </div>
                                        <p className="font-medium text-text-primary mt-1 transition-colors duration-300">{meeting.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action buttons card */}
                    <div className="bg-card-bg rounded-xl shadow-sm border border-border p-6 transition-colors duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Schedule button */}
                            <button className="
                flex flex-col items-center justify-center 
                p-4 rounded-xl 
                bg-action-btn/10 
                hover:bg-action-btn/20 
                transition-colors
                group
              ">
                                <div className="w-12 h-12 bg-action-btn rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span className="text-xs font-medium text-text-secondary transition-colors duration-300">Schedule a Webinar</span>
                            </button>

                            {/* Join button */}
                            <button className="
                flex flex-col items-center justify-center 
                p-4 rounded-xl 
                bg-action-btn/10 
                hover:bg-action-btn/20 
                transition-colors
                group
              ">
                                <div className="w-12 h-12 bg-action-btn rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <span className="text-xs font-medium text-text-secondary transition-colors duration-300">Join a Webinar</span>
                            </button>

                            {/* Recordings button - spans 2 cols */}
                            <button className="
                col-span-2
                flex flex-col items-center justify-center 
                p-4 rounded-xl 
                bg-action-btn/10 
                hover:bg-action-btn/20 
                transition-colors
                group
              ">
                                <div className="w-12 h-12 bg-action-btn rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <span className="text-xs font-medium text-text-secondary transition-colors duration-300">Open Recordings</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
