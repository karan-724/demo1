export default async function handler(req, res) {
    try {
        const response = await fetch('https://new-ss-git-main-jjs-projects-1b78d7d6.vercel.app/api/increment');
        const data = await response.json();

        res.status(200).json({ success: true, currentCount: data?.currentCount || 0 });
    } catch (error) {
        console.error('Failed to fetch external count:', error);
        res.status(500).json({ success: false, message: 'Failed to get external count' });
    }
}
