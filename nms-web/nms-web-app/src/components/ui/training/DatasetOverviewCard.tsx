'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface DatasetStats {
  totalRecords: number;
  lastAnonymized: string | null;
  newRecordsSinceLastTraining: number;
  distribution: {
    ageGroups: {
      '40-50': number;
      '51-60': number;
      '61-70': number;
      '71+': number;
    };
    gender: {
      Male: number;
      Female: number;
    };
    riskLevels: {
      Low: number;
      Moderate: number;
      High: number;
    };
  };
}

export default function DatasetOverviewCard() {
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/anonymization/stats');

      if (!response.ok) {
        throw new Error('Failed to fetch dataset statistics');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-md p-6">
        <div className="text-destructive">
          <p className="font-semibold">Error loading dataset statistics</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-3 text-sm px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const totalGender = stats.distribution.gender.Male + stats.distribution.gender.Female;
  const totalRisk =
    stats.distribution.riskLevels.Low +
    stats.distribution.riskLevels.Moderate +
    stats.distribution.riskLevels.High;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Dataset Overview
        </h2>
        <button
          onClick={fetchStats}
          className="text-sm text-primary hover:underline"
        >
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Records</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.totalRecords.toLocaleString()}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">New Since Last Training</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.newRecordsSinceLastTraining.toLocaleString()}
          </p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">Last Anonymized</p>
          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
            {stats.lastAnonymized
              ? new Date(stats.lastAnonymized).toLocaleDateString()
              : 'Never'}
          </p>
        </div>
      </div>

      {/* Demographic Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase">
          Demographic Breakdown
        </h3>

        {/* Gender */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Gender Distribution</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-muted rounded p-2">
              <p className="text-xs text-muted-foreground">Male</p>
              <p className="text-lg font-semibold text-foreground">
                {stats.distribution.gender.Male}
              </p>
              <p className="text-xs text-muted-foreground">
                {totalGender > 0
                  ? ((stats.distribution.gender.Male / totalGender) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <div className="flex-1 bg-muted rounded p-2">
              <p className="text-xs text-muted-foreground">Female</p>
              <p className="text-lg font-semibold text-foreground">
                {stats.distribution.gender.Female}
              </p>
              <p className="text-xs text-muted-foreground">
                {totalGender > 0
                  ? ((stats.distribution.gender.Female / totalGender) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>

        {/* Age Groups */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Age Groups</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(stats.distribution.ageGroups).map(([range, count]) => (
              <div key={range} className="bg-muted rounded p-2">
                <p className="text-xs text-muted-foreground">{range}</p>
                <p className="text-lg font-semibold text-foreground">{count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Levels */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Risk Level Distribution</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-500/10 border border-green-500/20 rounded p-2">
              <p className="text-xs text-green-600 dark:text-green-400">Low</p>
              <p className="text-lg font-semibold text-foreground">
                {stats.distribution.riskLevels.Low}
              </p>
              <p className="text-xs text-muted-foreground">
                {totalRisk > 0
                  ? ((stats.distribution.riskLevels.Low / totalRisk) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-2">
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Moderate</p>
              <p className="text-lg font-semibold text-foreground">
                {stats.distribution.riskLevels.Moderate}
              </p>
              <p className="text-xs text-muted-foreground">
                {totalRisk > 0
                  ? ((stats.distribution.riskLevels.Moderate / totalRisk) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
              <p className="text-xs text-red-600 dark:text-red-400">High</p>
              <p className="text-lg font-semibold text-foreground">
                {stats.distribution.riskLevels.High}
              </p>
              <p className="text-xs text-muted-foreground">
                {totalRisk > 0
                  ? ((stats.distribution.riskLevels.High / totalRisk) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}