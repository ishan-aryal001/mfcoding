export default function Avatar({ user, size = 36 }) {
  if (user?.avatar) return <img src={user.avatar} alt="" className="rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 font-bold text-white" style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {user?.name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}
