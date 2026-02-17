export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="flex items-center justify-center p-8 bg-background">
                {children}
            </div>
            <div className="hidden lg:flex flex-col justify-center p-12 bg-muted text-muted-foreground border-l">
                <div className="mx-auto max-w-md space-y-4">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;This admin panel provides the tools needed to manage the Student Referral Program effectively. Ensure all verification steps are followed carefully.&rdquo;
                        </p>
                        <footer className="text-sm">Admin Team</footer>
                    </blockquote>
                </div>
            </div>
        </div>
    )
}
