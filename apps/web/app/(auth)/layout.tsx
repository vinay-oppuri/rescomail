interface Props {
    children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
    return (
        <div className="flex justify-center items-center w-full min-h-screen bg-background">
            {children}
        </div>
    )
}
export default Layout
