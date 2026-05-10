"use client";
// import Header from "@/components/layout/Header";
// import Footer from "@/components/layout/Footer";
import GlitchBoxProvider from "@/transitions/GlitchBoxProvider";

import Providers from "@/components/provider";

export default function LayoutClient({ children }: { children: React.ReactNode }) {

    return (
<Providers>

            <GlitchBoxProvider>
                {/* <Header /> */}
                <main className="flex-1">{children}</main>
                {/* <Footer /> */}
            </GlitchBoxProvider>

</Providers>

    );
}