import app, { init } from "./app";
import config from 'config'

(async () => {
    const port = config.get<number>('app.port')
    const name = config.get<string>('app.name')

    await init()
    app.listen(port, () => console.log(`app ${name} started on port ${port}....`))
})()