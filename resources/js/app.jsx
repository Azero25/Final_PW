import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "../css/app.css";
import LandingPage from "./Pages/LandingPage";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import CaraKerjaPage from "./Pages/CaraKerjaPage";
import BuatPengaduanPage from "./Pages/BuatPengaduanPage";
import StatistikPage from "./Pages/StatistikPage";
import LacakPage from "./Pages/LacakPage";
import AdminDashboardPage from "./Pages/AdminPage/AdminDashboardPage";
import ManajemenLaporanPage from "./Pages/AdminPage/ManajemenLaporanPage";
import PenggunaPage from "./Pages/AdminPage/PenggunaPage";
import PetugasDinasPage from "./Pages/AdminPage/PetugasDinasPage";
import KategoriPage from "./Pages/AdminPage/KategoriPage";
import NotifikasiPage from "./Pages/AdminPage/NotifikasiPage";
import ProfilePage from "./Pages/ProfilePage";
import RiwayatLaporanPage from "./Pages/RiwayatLaporanPage";
import LoginPetugasPage from "./Pages/PetugasPage/LoginPetugasPage";
import PetugasDashboardPage from "./Pages/PetugasPage/PetugasDashboardPage";
import LaporanPetugasPage from "./Pages/PetugasPage/LaporanPetugasPage";
import ProtectedRoute from "./Components/ProtectedRoute";
import { Navigate } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("app")).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/cara-kerja" element={<CaraKerjaPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login-petugas" element={<LoginPetugasPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/buat-pengaduan" element={<BuatPengaduanPage />} />
            <Route path="/statistik" element={<StatistikPage />} />
            <Route path="/lacak" element={<LacakPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/riwayat" element={<RiwayatLaporanPage />} />
            
            {/* Protected Routes: Petugas */}
            <Route element={<ProtectedRoute role="petugas" />}>
                <Route path="/petugas/dashboard" element={<PetugasDashboardPage />} />
                <Route path="/petugas/laporan" element={<LaporanPetugasPage />} />
            </Route>

            {/* Protected Routes: Admin */}
            <Route element={<ProtectedRoute role="admin" />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/laporan" element={<ManajemenLaporanPage />} />
                <Route path="/admin/pengguna" element={<PenggunaPage />} />
                <Route path="/admin/petugas" element={<PetugasDinasPage />} />
                <Route path="/admin/kategori" element={<KategoriPage />} />
                <Route path="/admin/notifikasi" element={<NotifikasiPage />} />
            </Route>

            {/* Fallback 404 - Redirect ke Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </BrowserRouter>
);
