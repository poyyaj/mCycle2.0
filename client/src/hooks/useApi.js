import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function useApi(endpoint) {
    const { token } = useAuth();
    const headers = { Authorization: `Bearer ${token}` };

    const get = useCallback(async (params = {}) => {
        const res = await axios.get(endpoint, { headers, params });
        return res.data;
    }, [endpoint, token]);

    const post = useCallback(async (data) => {
        const res = await axios.post(endpoint, data, { headers });
        return res.data;
    }, [endpoint, token]);

    const put = useCallback(async (id, data) => {
        const res = await axios.put(`${endpoint}/${id}`, data, { headers });
        return res.data;
    }, [endpoint, token]);

    const del = useCallback(async (id) => {
        const res = await axios.delete(`${endpoint}/${id}`, { headers });
        return res.data;
    }, [endpoint, token]);

    return { get, post, put, del };
}

export function useCycles() {
    const [cycles, setCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const api = useApi('/api/cycles');

    const fetchCycles = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get();
            setCycles(data.cycles || []);
        } catch (err) {
            console.error('Fetch cycles error:', err);
        }
        setLoading(false);
    }, [api]);

    useEffect(() => { fetchCycles(); }, []);

    const addCycle = async (cycle) => {
        const data = await api.post(cycle);
        setCycles(prev => [data.cycle, ...prev]);
        return data.cycle;
    };

    const deleteCycle = async (id) => {
        await api.del(id);
        setCycles(prev => prev.filter(c => c.id !== id));
    };

    return { cycles, loading, fetchCycles, addCycle, deleteCycle };
}

export function useMetrics() {
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const api = useApi('/api/metrics');

    const fetchMetrics = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get();
            setMetrics(data.metrics || []);
        } catch (err) {
            console.error('Fetch metrics error:', err);
        }
        setLoading(false);
    }, [api]);

    useEffect(() => { fetchMetrics(); }, []);

    const addMetric = async (metric) => {
        const data = await api.post(metric);
        setMetrics(prev => [data.metric, ...prev]);
        return data.metric;
    };

    return { metrics, loading, fetchMetrics, addMetric };
}

export function useLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const api = useApi('/api/logs');

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get();
            setLogs(data.logs || []);
        } catch (err) {
            console.error('Fetch logs error:', err);
        }
        setLoading(false);
    }, [api]);

    useEffect(() => { fetchLogs(); }, []);

    const addLog = async (log) => {
        const data = await api.post(log);
        setLogs(prev => [data.log, ...prev]);
        return data.log;
    };

    return { logs, loading, fetchLogs, addLog };
}

export function useInsights() {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    const fetchInsights = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/insights/summary', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInsights(res.data);
        } catch (err) {
            console.error('Fetch insights error:', err);
        }
        setLoading(false);
    }, [token]);

    useEffect(() => { fetchInsights(); }, []);

    return { insights, loading, fetchInsights };
}
