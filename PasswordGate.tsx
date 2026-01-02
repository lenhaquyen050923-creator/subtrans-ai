import { useState } from "react";

const PASSWORD = "khanhan1230@";

export default function PasswordGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [input, setInput] = useState("");
  const [ok, setOk] = useState(false);

  if (ok) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-lg font-semibold mb-4 text-center">
          Nhập mật khẩu
        </h2>

        <input
          type="password"
          placeholder="Mật khẩu"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-4 py-2 border rounded mb-4"
        />

        <button
          onClick={() => {
            if (input === PASSWORD) setOk(true);
            else alert("Sai mật khẩu");
          }}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Vào
        </button>
      </div>
    </div>
  );
}
