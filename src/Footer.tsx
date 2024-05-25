export default function Footer() {
    return (
        <footer>
                <p>&copy; {new Date().getFullYear()} Flight Incidents Tracker. All rights reserved.</p>

            <p>Data sourced from:</p><a href="https://aviation-safety.net/database/">Aviation Safety Network</a>

            <p>Thanks to Our Sponsors: </p> 
        <a href="https://surfmad.org" target='_blank' rel='noreferrer'><img src="https://surfmad.org/logo.png" alt="SurfMad.org" height={25} width={25} /></a>
        <a href="https://passportbroslist.com" target='_blank' rel='noreferrer'><img src="https://passportbroslist.com/logo.png" alt="PassportBrosList.com" height={25} width={25} /></a>
        </footer>
    );
}