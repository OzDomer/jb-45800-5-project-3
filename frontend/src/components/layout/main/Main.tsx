import { Navigate, Route, Routes } from "react-router-dom";
import RequireAuth from "../../auth/guards/RequireAuth";
import RequireAdmin from "../../auth/guards/RequireAdmin";
import GuestOnly from "../../auth/guards/GuestOnly";
import Login from "../../auth/login/Login";
import Register from "../../auth/register/Register";
import Vacations from "../../vacations/list/Vacations";
import Ai from "../../ai/Ai";
import Assistant from "../../assistant/Assistant";
import Admin from "../../admin/list/Admin";
import AddVacation from "../../admin/add/AddVacation";
import EditVacation from "../../admin/edit/EditVacation";
import Reports from "../../admin/reports/Reports";
import About from "../../about/About";
import NotFound from "../not-found/NotFound";

export default function Main() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/vacations" />} />

            <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

            <Route path="/vacations" element={<RequireAuth><Vacations /></RequireAuth>} />
            <Route path="/ai" element={<RequireAuth><Ai /></RequireAuth>} />
            <Route path="/assistant" element={<RequireAuth><Assistant /></RequireAuth>} />

            <Route path="/admin" element={<RequireAuth><RequireAdmin><Admin /></RequireAdmin></RequireAuth>} />
            <Route path="/admin/add" element={<RequireAuth><RequireAdmin><AddVacation /></RequireAdmin></RequireAuth>} />
            <Route path="/admin/edit/:vacationId" element={<RequireAuth><RequireAdmin><EditVacation /></RequireAdmin></RequireAuth>} />
            <Route path="/admin/reports" element={<RequireAuth><RequireAdmin><Reports /></RequireAdmin></RequireAuth>} />

            {/* about is open to guests as well */}
            <Route path="/about" element={<About />} />

            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}