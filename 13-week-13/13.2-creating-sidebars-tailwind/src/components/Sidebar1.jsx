export const Sidebar1 = function () {
    return <div className="flex">
        {/* 
            Sidebar Transition Notes:
            1. transition-all duration-500: Enables smooth animation for all changing properties over 500ms.
            2. w-0 md:w-96: Animates width from 0 (mobile) to 96 (desktop). 
            3. overflow-hidden: CRITICAL. As width shrinks to 0, this hides the inner text ("Sidebar"). 
               Without it, text would spill out and remain visible even when width is 0.
            4. Why not 'hidden'? 'hidden' applies 'display: none', which cannot be animated. 
               We use width-based visibility to allow the smooth slide effect.
        */}
        <div className="h-screen transition-all duration-500 ease-in-out bg-sidebar w-0 md:w-96 overflow-hidden md:p-10">
            Sidebar
        </div>
        <div className="h-screen bg-primary w-full p-10">
            Content
        </div>
    </div>
}