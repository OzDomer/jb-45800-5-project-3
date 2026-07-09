// invents an airport-style code for a fictional destination:
// keep the first letter, then the next two consonants
// (Atlantis -> ATL, Hogwarts -> HGW, Middle-earth -> MDD)
export function destinationCode(destination: string): string {
    const letters = destination.toUpperCase().replace(/[^A-Z]/g, '')

    if (!letters) return '???'

    let code = letters[0]

    for (let i = 1; i < letters.length && code.length < 3; i++) {
        if (!'AEIOU'.includes(letters[i])) code += letters[i]
    }

    // very vowely destination: pad with whatever is left
    for (let i = 1; i < letters.length && code.length < 3; i++) {
        if (!code.includes(letters[i]) || i >= code.length) code += letters[i]
    }

    return code.padEnd(3, 'X').slice(0, 3)
}