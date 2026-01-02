export type WorkerRole =
    // Payment & Finance
    | 'payment_verifier'
    | 'payment_approver'
    | 'payment_rejector'


    // Content & Media
    | 'mood_content_uploader'
    | 'content_editor'
    | 'content_curator'
    | 'short_video_operator'
    | 'visual_asset_manager'

    // User Experience & Support
    | 'user_support_agent'
    | 'community_moderator'
    | 'trust_safety_analyst'

    // Operations & Speed
    | 'rapid_response_operator'
    | 'queue_manager'
    | 'shift_supervisor'

    // Analytics & Monitoring
    | 'metrics_viewer'
    | 'performance_analyst'

    // Content Quality & Brand
    | 'quality_reviewer'
    | 'brand_tone_reviewer'

    // Advanced / Trusted
    | 'operations_lead'
    | 'emergency_operator';

export interface RoleDefinition {
    id: WorkerRole;
    label: string;
    category: string;
    description: string;
    permissions: string[];
}

export const WORKER_ROLES: RoleDefinition[] = [
    // Payment & Finance
    {
        id: 'payment_verifier',
        label: 'Payment Verifier',
        category: 'Payment & Finance',
        description: 'Check screenshots, verify sender name & amount.',
        permissions: ['view_payments', 'verify_payment']
    },
    {
        id: 'payment_approver',
        label: 'Payment Approver',
        category: 'Payment & Finance',
        description: 'Approve verified payments, trigger plan upgrade.',
        permissions: ['view_verified_payments', 'approve_payment']
    },
    {
        id: 'payment_rejector',
        label: 'Payment Rejector',
        category: 'Payment & Finance',
        description: 'Reject invalid proofs with reasons.',
        permissions: ['view_payments', 'reject_payment']
    },


    // Content & Media
    {
        id: 'mood_content_uploader',
        label: 'Mood Content Uploader',
        category: 'Content & Media',
        description: 'Upload mood videos and assign moods.',
        permissions: ['upload_mood_video', 'manage_moods']
    },
    {
        id: 'content_editor',
        label: 'Content Editor',
        category: 'Content & Media',
        description: 'Edit titles, descriptions, fix moods.',
        permissions: ['edit_content_metadata']
    },
    {
        id: 'content_curator',
        label: 'Content Curator',
        category: 'Content & Media',
        description: 'Feature content and adjust homepage order.',
        permissions: ['feature_content', 'reorder_content']
    },
    {
        id: 'short_video_operator',
        label: 'Short Video Operator',
        category: 'Content & Media',
        description: 'Upload shorts optimized for retention.',
        permissions: ['upload_shorts']
    },
    {
        id: 'visual_asset_manager',
        label: 'Visual Asset Manager',
        category: 'Content & Media',
        description: 'Upload images and manage galleries.',
        permissions: ['upload_images', 'manage_galleries']
    },

    // User Experience & Support
    {
        id: 'user_support_agent',
        label: 'User Support Agent',
        category: 'User Experience & Support',
        description: 'Handle user issues and guide upgrades.',
        permissions: ['view_users', 'respond_support']
    },
    {
        id: 'community_moderator',
        label: 'Community Moderator',
        category: 'User Experience & Support',
        description: 'Flag harmful content, hide content.',
        permissions: ['flag_content', 'hide_content']
    },
    {
        id: 'trust_safety_analyst',
        label: 'Trust & Safety Analyst',
        category: 'User Experience & Support',
        description: 'Detect abuse and flag suspicious behavior.',
        permissions: ['view_logs', 'flag_user']
    },

    // Operations & Speed
    {
        id: 'rapid_response_operator',
        label: 'Rapid Response Operator',
        category: 'Operations & Speed',
        description: 'Handle urgent tasks across queues.',
        permissions: ['any_queue_read']
    },
    {
        id: 'queue_manager',
        label: 'Queue Manager',
        category: 'Operations & Speed',
        description: 'Monitor task queues and assign tasks.',
        permissions: ['view_queues', 'assign_tasks']
    },
    {
        id: 'shift_supervisor',
        label: 'Shift Supervisor',
        category: 'Operations & Speed',
        description: 'Monitor worker activity and SLA.',
        permissions: ['view_worker_stats']
    },

    // Analytics & Monitoring
    {
        id: 'metrics_viewer',
        label: 'Metrics Viewer',
        category: 'Analytics & Monitoring',
        description: 'View system stats and approval times.',
        permissions: ['view_metrics']
    },
    {
        id: 'performance_analyst',
        label: 'Performance Analyst',
        category: 'Analytics & Monitoring',
        description: 'Track worker speed and flag slow ops.',
        permissions: ['view_worker_performance']
    },

    // Content Quality & Brand
    {
        id: 'quality_reviewer',
        label: 'Quality Reviewer',
        category: 'Content Quality & Brand',
        description: 'Flag low-quality uploads.',
        permissions: ['flag_content_quality']
    },
    {
        id: 'brand_tone_reviewer',
        label: 'Brand Tone Reviewer',
        category: 'Content Quality & Brand',
        description: 'Ensure emotional accuracy and fix tags.',
        permissions: ['edit_content_tags']
    },

    // Advanced / Trusted
    {
        id: 'operations_lead',
        label: 'Operations Lead',
        category: 'Advanced / Trusted',
        description: 'Approve payments, edit content, feature content.',
        permissions: ['approve_payment', 'edit_content', 'feature_content']
    },
    {
        id: 'emergency_operator',
        label: 'Emergency Operator',
        category: 'Advanced / Trusted',
        description: 'Freeze queues temporarily during incidents.',
        permissions: ['freeze_queues']
    }
];

export const getRoleDefinition = (roleId: WorkerRole) => WORKER_ROLES.find(r => r.id === roleId);
