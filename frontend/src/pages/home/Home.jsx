import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'mahasiswa',
      title: 'Mahasiswa',
      desc: 'Cari lowongan & kelola magang',
      icon: (
        <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
    },
    {
      id: 'dosen',
      title: 'Dosen',
      desc: 'Pantau progres mahasiswa',
      icon: (
        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 'staff',
      title: 'Staff Akademik',
      desc: 'Kelola lowongan & verifikasi',
      icon: (
        <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  const handleRoleSelect = (roleId) => {
    // Navigasi ke login sambil mengirim data role yang dipilih
    navigate('/login', { state: { selectedRole: roleId } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistem Magang Mahasiswa</h1>
        <p className="text-gray-500">Pilih role untuk melanjutkan</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => handleRoleSelect(role.id)}
            className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
          >
            <div className="mb-4 p-3 bg-gray-50 rounded-xl">{role.icon}</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{role.title}</h2>
            <p className="text-sm text-gray-500">{role.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}