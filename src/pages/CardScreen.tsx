import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentMemberId, getMemberById, Member } from '../store';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

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
            <div className="luxury-card glow-purple flex flex-col items-center">
                <header className="w-full flex justify-between items-start mb-8">
                    <div>
                        <h2 className="text-[10px] uppercase tracking-[0.2em] text-text-secondary mb-1">tee phyno cutz</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-light tracking-wide">VIP member</span>
                            <Sparkles className="w-3 h-3 text-accent-purple" />
                        </div>
                    </div>
                    <div className="text-[10px] text-text-secondary bg-white/5 px-2 py-1 rounded">
                        {member.id}
                    </div>
                </header>

                <div className="bg-white p-4 rounded-2xl mb-8">
                    <QRCodeSVG
                        value={member.id}
                        size={200}
                        level="H"
                        includeMargin={false}
                    />
                </div>

                <div className="w-full text-center mb-8">
                    <h3 className="text-xl font-light mb-1">{member.name}</h3>
                    <p className="text-text-secondary text-xs">{member.visits} / 10 visits</p>
                </div>

                <div className="progress-dots">
                    {[...Array(10)].map((_, i) => (
                        <div
                            key={i}
                            className={`dot ${i < member.visits ? 'active' : ''}`}
                        />
                    ))}
                </div>

                <div className="w-full pt-4 border-t border-white/5 flex justify-between items-center mt-2">
                    <span className="text-text-secondary text-[10px] uppercase tracking-wider">Reward status</span>
                    <span className={`text-[11px] uppercase tracking-widest font-medium ${member.visits >= 10 ? 'text-accent-purple' : 'text-text-secondary'}`}>
                        {member.visits >= 10 ? 'Free Cut Available' : 'Progress to reward'}
                    </span>
                </div>
            </div>

            <p className="text-center text-text-secondary text-[10px] mt-8 uppercase tracking-[0.1em] opacity-50">
                Show this QR to your barber after your cut
            </p>
        </motion.div>
    );
};

export default CardScreen;
