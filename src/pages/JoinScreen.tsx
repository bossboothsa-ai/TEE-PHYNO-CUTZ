import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addMember, setCurrentMemberId } from '../store';
import { User, Phone, Cake } from 'lucide-react';
import { motion } from 'framer-motion';

const JoinScreen = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: 'Yolanda',
        phone: '123-456-7890',
        dob: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) return;

        const member = addMember(formData.name, formData.phone, formData.dob);
        setCurrentMemberId(member.id);
        navigate('/teephyno/card');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
        >
            <div className="text-center mb-10">
                <h2 className="text-text-secondary text-sm uppercase tracking-widest mb-1">tee phyno cutz</h2>
                <h1 className="text-3xl font-light">Join the VIP club</h1>
            </div>

            <form onSubmit={handleSubmit} className="luxury-card space-y-6">
                <div className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="full name"
                            className="input-field pl-12"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                        <input
                            type="tel"
                            placeholder="phone number"
                            className="input-field pl-12"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                    </div>

                    <div className="relative">
                        <Cake className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                        <input
                            type="date"
                            className="input-field pl-12"
                            value={formData.dob}
                            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        />
                    </div>
                </div>

                <button type="submit" className="btn-primary mt-4 glow-purple">
                    get my VIP card
                </button>
            </form>
        </motion.div>
    );
};

export default JoinScreen;
