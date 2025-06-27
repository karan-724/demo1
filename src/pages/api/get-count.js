export default async function handler(req, res) {
    try {
        const response = await fetch('https://new-ss-git-main-jjs-projects-1b78d7d6.vercel.app/api/get-count');
        const data = await response.json();

        res.status(200).json({ success: true, ...data });
    } catch (error) {
        console.error('Error fetching external API:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch external data' });
    }
}
