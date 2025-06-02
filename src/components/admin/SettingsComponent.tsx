import { FiSettings } from "react-icons/fi";

export const SettingsComponent = () => {
  return (
    <div className="text-center py-12">
      <FiSettings className="w-16 h-16 text-white/30 mx-auto mb-4" />
      <p className="text-white/70 text-lg">System Settings</p>
      <p className="text-white/50 text-sm">Coming soon...</p>
    </div>
  );
};
