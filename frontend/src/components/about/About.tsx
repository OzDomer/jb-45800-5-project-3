import './About.css'

export default function About() {
    return (
        <div className='About'>
            <h2>About</h2>

            <section>
                <h3>The system</h3>
                <p>
                    This vacations system lets registered users browse vacation packages to the
                    most legendary destinations that (mostly) do not exist, and tag the ones they
                    love with a like. Administrators manage the vacation catalog and track
                    popularity through live reports and CSV exports. An AI travel agent is
                    available to plan a day-by-day itinerary for any vacation on the site.
                </p>
            </section>

            <section>
                <h3>The developer</h3>
                <p>
                    Built by Oz Domer as part of the John Bryce Full Stack Web Developer course.
                    The stack: TypeScript end to end - Node.js, Express 5 and MySQL on the server,
                    React 19 with Redux Toolkit on the client, S3-compatible image storage, and
                    everything shipped as docker compose services.
                </p>
            </section>
        </div>
    )
}