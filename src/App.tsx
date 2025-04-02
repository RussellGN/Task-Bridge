import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "./components/general/Layout";
import { ROUTES } from "./lib/constants";

export default function App() {
   return (
      <BrowserRouter>
         <Routes>
            <Route Component={Layout}>
               {ROUTES.map((route) => (
                  <Route key={route.path} path={route.path} Component={route.component} />
               ))}
            </Route>
         </Routes>
      </BrowserRouter>
   );
}
