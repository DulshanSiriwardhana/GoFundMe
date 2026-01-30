export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold mb-4">About GoFundMe</h3>
            <p className="text-sm text-gray-400">
              Decentralized crowdfunding platform powered by blockchain technology.
            </p>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Features</h3>
            <ul className="text-sm space-y-2 text-gray-400">
              <li>Create campaigns</li>
              <li>Transparent funding</li>
              <li>Democratic voting</li>
              <li>Secure transactions</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Resources</h3>
            <ul className="text-sm space-y-2 text-gray-400">
              <li>Documentation</li>
              <li>How it works</li>
              <li>FAQ</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Legal</h3>
            <ul className="text-sm space-y-2 text-gray-400">
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Security</li>
              <li>Disclaimer</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-400">
              © {currentYear} GoFundMe. All rights reserved.
            </div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                Discord
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
