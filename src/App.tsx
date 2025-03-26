import { BrowserRouter, Route, Routes } from "react-router";
import Signin from "./routes/Signin";
import Layout from "./components/general/Layout";
export default function App() {
   return (
      <BrowserRouter>
         <Routes>
            <Route Component={Layout}>
               <Route path="/" Component={Signin} />
            </Route>
         </Routes>
      </BrowserRouter>
   );
}
