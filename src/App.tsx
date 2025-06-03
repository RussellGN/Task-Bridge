import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "./components/general/Layout";
import { ROUTES } from "./lib/constants";
import ReactQueryProvider from "./providers/ReactQueryProvider";
import ConnectionStatusProvider from "./providers/ConnectionStatusProvider";
import SyncedProjectsProvider from "./providers/SyncedProjectsProvider";

export default function App() {
   return (
      <SyncedProjectsProvider>
         <ConnectionStatusProvider>
            <ReactQueryProvider>
               <BrowserRouter>
                  <Routes>
                     <Route Component={Layout}>
                        {ROUTES.map((route) => (
                           <Route key={route.path} path={route.path} Component={route.component} />
                        ))}
                     </Route>
                  </Routes>
               </BrowserRouter>
            </ReactQueryProvider>
         </ConnectionStatusProvider>
      </SyncedProjectsProvider>
   );
}
