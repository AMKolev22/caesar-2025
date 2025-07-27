export default function Page() {
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center leading-wide tracking-wide">
            <h1 className="text-white text-xl font-semibold text-center">Sorry, you're not allowed to visit this page yet.</h1>
            <a href="/dashboard">Click <span className="underline hover:-translate-y-1 font-semibold">here</span> to go back</a>
        </div>
    )
}