import { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { getMemberById, updateVisit, redeemReward, getMembers } from '../store';
import type { Member } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Users, Scissors, Star, CheckCircle2, ArrowLeft } from 'lucide-react';

const StaffScreen = () => {
    const [isScanning, setIsScanning] = useState(false);
    const [lastScannedMember, setLastScannedMember] = useState<Member | null>(null);
    const [successMode, setSuccessMode] = useState<'visit' | 'redeem' | null>(null);
    const [stats, setStats] = useState({ members: 0, visits: 0, rewards: 0 });
    const [scanError, setScanError] = useState<string | null>(null);
    const qrRef = useRef<Html5Qrcode | null>(null);
    const scannerId = "staff-qr-reader";

    useEffect(() => {
        updateStats();
    }, []);

    const updateStats = () => {
        const all = getMembers();
        const visits = all.reduce((acc, m) => acc + m.visits, 0);
        const rewards = all.reduce((acc, m) => acc + m.totalRewards, 0);
        setStats({ members: all.length, visits, rewards });
    };

    const startScanning = async () => {
        setIsScanning(true);
        setLastScannedMember(null);
        setSuccessMode(null);

        // Give the DOM a moment to mount the reader div
        setTimeout(async () => {
            try {
                const html5QrCode = new Html5Qrcode(scannerId);
                qrRef.current = html5QrCode;

                await html5QrCode.start(
                    { facingMode: "environment" }, // BACK camera
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    (decodedText) => {
                        handleScan(decodedText);
                    },
                    () => { } // handle errors silently
                );
            } catch (err) {
                console.error("Camera error:", err);
                setIsScanning(false);
            }
        }, 100);
    };

    const stopScanning = async () => {
        if (qrRef.current && qrRef.current.isScanning) {
            await qrRef.current.stop();
            qrRef.current = null;
        }
        setIsScanning(false);
    };

    const handleScan = (rawText: string) => {
        // Parse /scan/{memberId} from the scanned URL
        let memberId: string | null = null;
        try {
            const url = new URL(rawText);
            const match = url.pathname.match(/^\/scan\/(.+)/);
            if (match) memberId = match[1];
        } catch {
            // rawText might not be a URL – treat as raw id for legacy
            if (rawText.startsWith('TPC-')) memberId = rawText;
        }

        if (!memberId) {
            // Wall QR or unrecognised code
            stopScanning();
            setScanError('Wrong QR type. Ask the customer to show their Member Card QR.');
            setTimeout(() => setScanError(null), 3500);
            return;
        }

        const member = getMemberById(memberId);
        if (member) {
            stopScanning();
            setLastScannedMember(member);
        } else {
            stopScanning();
            setScanError('Member not found. QR may be from a different device.');
            setTimeout(() => setScanError(null), 3500);
        }
    };

    const handleAddVisit = () => {
        if (!lastScannedMember) return;
        const updated = updateVisit(lastScannedMember.id);
        if (updated) {
            setLastScannedMember(updated);
            setSuccessMode('visit');
            updateStats();
            setTimeout(() => {
                setLastScannedMember(null);
                setSuccessMode(null);
            }, 1500);
        }
    };

    const handleRedeem = () => {
        if (!lastScannedMember) return;
        const updated = redeemReward(lastScannedMember.id);
        if (updated) {
            setLastScannedMember(updated);
            setSuccessMode('redeem');
            updateStats();
            setTimeout(() => {
                setLastScannedMember(null);
                setSuccessMode(null);
            }, 1500);
        }
    };

    return (
        <div className="w-full max-w-lg min-h-screen flex flex-col py-10 px-6">
            <header className="text-center mb-12">
                <h2 className="text-[10px] uppercase tracking-[0.3em] text-text-secondary mb-2">tee phyno cutz</h2>
                <h1 className="text-2xl font-light">Scan Station</h1>
            </header>

            {!isScanning && !lastScannedMember && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-between"
                >
                    <button
                        onClick={startScanning}
                        className="w-48 h-48 rounded-full bg-accent-purple/10 border-2 border-accent-purple/30 flex flex-col items-center justify-center gap-4 glow-purple transition-all active:scale-95 group mb-8"
                    >
                        <div className="bg-accent-purple p-4 rounded-full">
                            <Scan className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-xs uppercase tracking-widest text-text-secondary group-hover:text-white">tap to scan</span>
                    </button>

                    <div className="grid grid-cols-3 gap-8 w-full luxury-card p-6">
                        <div className="text-center">
                            <span className="text-2xl font-light block mb-1">{stats.visits}</span>
                            <span className="text-[9px] uppercase tracking-wider text-text-secondary">Visits</span>
                        </div>
                        <div className="text-center border-x border-white/5">
                            <span className="text-2xl font-light block mb-1">{stats.rewards}</span>
                            <span className="text-[9px] uppercase tracking-wider text-text-secondary">Rewards</span>
                        </div>
                        <div className="text-center">
                            <span className="text-2xl font-light block mb-1">{stats.members}</span>
                            <span className="text-[9px] uppercase tracking-wider text-text-secondary">Members</span>
                        </div>
                    </div>

                    <div className="mt-10 flex items-center gap-2 text-text-secondary opacity-30">
                        <Users className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-widest">Active Staff Mode</span>
                    </div>
                </motion.div>
            )}

            {isScanning && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
                    <div className="w-full max-w-sm px-6">
                        <div id={scannerId} className="qr-frame overflow-hidden w-full max-w-xs mx-auto"></div>
                        <button
                            onClick={stopScanning}
                            className="mt-12 text-text-secondary flex items-center gap-2 mx-auto hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm uppercase tracking-widest">cancel</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Scan error toast */}
            <AnimatePresence>
                {scanError && (
                    <motion.div
                        key="scan-error"
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 60 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-red-900/80 border border-red-500/40 text-red-200 text-xs uppercase tracking-widest px-6 py-4 rounded-2xl text-center max-w-xs backdrop-blur-sm shadow-xl"
                    >
                        {scanError}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {lastScannedMember && (
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed inset-0 z-[60] bg-[#050208] p-6 flex items-center justify-center"
                    >
                        <div className="luxury-card w-full max-w-sm text-center">
                            {successMode ? (
                                <div className="py-10 flex flex-col items-center">
                                    <motion.div
                                        initial={{ scale: 0.5 }}
                                        animate={{ scale: 1 }}
                                        className="bg-accent-purple/20 p-4 rounded-full mb-6"
                                    >
                                        <CheckCircle2 className="w-12 h-12 text-accent-purple" />
                                    </motion.div>
                                    <h2 className="text-2xl font-light mb-2">{lastScannedMember.name}</h2>
                                    <p className="text-text-secondary uppercase tracking-widest text-[10px]">
                                        {successMode === 'visit' ? `Visit ${lastScannedMember.visits} / 10 added` : 'Reward Redeemed'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-text-secondary text-[10px] uppercase tracking-[0.2em] mb-4">member found</h2>
                                    <h3 className="text-3xl font-light mb-2">{lastScannedMember.name}</h3>
                                    <div className="flex items-center justify-center gap-2 text-text-secondary text-sm mb-10">
                                        <Scissors className="w-4 h-4" />
                                        <span>{lastScannedMember.visits} / 10 Visits</span>
                                    </div>

                                    <div className="space-y-4">
                                        <button
                                            onClick={handleAddVisit}
                                            className="btn-primary"
                                        >
                                            <Star className="w-4 h-4" />
                                            Add Visit
                                        </button>

                                        {lastScannedMember.visits >= 10 && (
                                            <button
                                                onClick={handleRedeem}
                                                className="btn-primary bg-white text-black hover:bg-white/90"
                                            >
                                                Redeem Free Cut
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setLastScannedMember(null)}
                                            className="w-full text-text-secondary text-xs uppercase tracking-widest py-4"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StaffScreen;
