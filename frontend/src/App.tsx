import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import { Toaster } from "sonner";

export const description =
  "A settings page. The settings page has a sidebar navigation and a main content area. The main content area has a form to update the store name and a form to update the plugins directory. The sidebar navigation has links to general, security, integrations, support, organizations, and advanced settings.";

export function App() {
  return (
    <div className="flex justify-center bg-[radial-gradient(#576faa_1px,transparent_1px)] [background-size:32px_32px]">
      <div className="flex min-h-screen max-w-[1080px] w-full flex-col">
        <div className="fixed top-0 left-0 right-0 z-50">
          <Header />
        </div>
        <div className="mt-16 flex-grow overflow-auto">
          <Outlet />
        </div>
        <Toaster richColors expand={false} duration={2000} closeButton={true} />
      </div>
    </div>
  );
}

export default App;