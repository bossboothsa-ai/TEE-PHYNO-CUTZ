import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentMemberId, getMemberById } from '../store';
import type { Member } from '../store';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';

const CardScreen = () => {
    const navigate = useNavigate();
    const [member, setMember] = useState<Member | null>(null);

    useEffect(() => {
        const id = getCurrentMemberId();
        if (!id) {
            navigate('/teephyno/join');
            return;
        }

        const data = getMemberById(id);
        if (!data) {
            navigate('/teephyno/join');
            return;
        }

        setMember(data);

        // Refresh data periodically in case staff adds visit while user is looking at card
        const interval = setInterval(() => {
            const updated = getMemberById(id);
            if (updated) setMember(updated);
        }, 2000);

        return () => clearInterval(interval);
    }, [navigate]);

    if (!member) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm"
        >
            {/* Luxury VIP Card Container */}
            <div className="luxury-card glow-purple flex flex-col items-center p-8">
                {/* Header */}
                <header className="w-full text-center mb-10">
                    <h2 className="text-[12px] uppercase tracking-[0.3em] text-text-secondary mb-3">MEMBER ACCESS</h2>
                    <h3 className="text-2xl font-light tracking-wider text-white">{member.name}</h3>
                </header>

                {/* QR Code Section */}
                <div className="bg-white p-6 rounded-3xl mb-10 w-[80%] shadow-lg">
                    <QRCodeSVG
                        value={`${window.location.origin}/scan/${member.id}`}
                        size={220}
                        level="H"
                        includeMargin={false}
                    />
                </div>

                {/* Status Section */}
                <div className="status-section">
                    <div className="status-item">
                        <span className="status-label">Salon Visits</span>
                        <span className="status-value">{member.visits} visits</span>
                    </div>
                    <div className="status-item">
                        <span className="status-label">Total Rewards</span>
                        <span className="status-value">{member.totalRewards} rewards</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="w-full text-center">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary opacity-60">
                        TEE PHYNO CUTZ VIP
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default CardScreen;
