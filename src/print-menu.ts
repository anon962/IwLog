type Potencies = Record<string, number>

interface InitLine {
    type: "init"
    info: {
        name: string
        eid: string
        key: string
    }
    date: string
}

interface RunLine {
    type: "run"
    potencies: Potencies
    date: string
}

interface ReforgeLine {
    type: "reforge"
    potencies: Potencies
    date: string
}

type Log = Array<InitLine | RunLine | ReforgeLine>

export function showPrintMenu() {
    const rawLogs = localStorage.getItem("hvw_iw_log") || "{}"

    // Sort by most recent first
    const logs: Log[] = Object.values(JSON.parse(rawLogs))
    logs.sort((left, right) => {
        const leftDate = Date.parse(left[0].date) || 0
        const rightDate = Date.parse(right[0].date) || 0
        return leftDate - rightDate
    }).reverse()

    // Dump
    // const newTab = window.open("about:blank", "_blank")
    console.log(printText(logs[0]))
}

function validateLog(log: Log): void {
    if (log.length === 0) {
        return
    }

    if (log[0].type !== "init") {
        throw Error("Invalid log. First line is not of type 'init'")
    }

    if (log.slice(1).filter((ln) => ln.type === "init")) {
        throw Error("Invalid log. Multiple lines of type 'init' found")
    }
}

function printText(log: Log): string {
    type PrintedLine = { totalReforges: number; potencies: Potencies }
    let lines: PrintedLine[] = []

    let totalReforges = 0
    for (let i = 2; i < log.length; i++) {
        const ln = log[i]
        const prevLn = log[i - 1]

        switch (ln.type) {
            case "run":
                if (prevLn.type !== "run") {
                    // If previous line was a reforge, we know the current potencies are empty, so skip
                    continue
                }

                lines.push({
                    totalReforges,
                    potencies: ln.potencies,
                })
                continue
            case "reforge":
                // Show final results of previous trial
                lines.push({
                    totalReforges,
                    potencies: ln.potencies,
                })
                totalReforges += 1
                continue
            default:
                throw Error()
        }
    }

    // Group consecutive runs without reforge
    let linesGrouped: PrintedLine[][]
    if (lines.length > 1) {
        linesGrouped = []
        let buffer = [lines[0]]
        for (let ln of lines.slice(1)) {
            const prevReforges = buffer[0].totalReforges
            if (ln.totalReforges === prevReforges) {
                buffer.push(ln)
            } else {
                linesGrouped.push(buffer)
                buffer = [ln]
            }
        }
        linesGrouped.push(buffer)
    } else {
        linesGrouped = [[lines[0]]]
    }

    // Stringify each line
    const divider = Symbol()
    const lineStrs: Array<string | typeof divider> = [divider]
    for (let i = 0; i < linesGrouped.length; i++) {
        const grp = linesGrouped[i]

        for (let ln of grp) {
            let reforgeCol: string
            if (ln === grp[0] && grp === linesGrouped[0]) {
                reforgeCol = `${ln.totalReforges} Reforges` // This line is 10 characters wide
            } else if (ln === grp[0]) {
                reforgeCol = padCenter(ln.totalReforges, 10)
            } else {
                reforgeCol = padCenter("-", 10)
            }

            const potencyCol = Object.entries(ln.potencies)
                .map(([name, lvl]) => {
                    name = titleCase(shortenPotency(name))
                    return `${name} ${lvl}`
                })
                .join(", ")

            const row = `${reforgeCol} | ${potencyCol}`
            lineStrs.push(row)
        }

        const nextGrp = linesGrouped[i + 1]
        const isLast = i === linesGrouped.length - 1
        if (grp.length > 1 || isLast || nextGrp.length > 1) {
            lineStrs.push(divider)
        }
    }

    // Stringify dividers
    const divLength = lineStrs.reduce((maxWidth, ln) => {
        if (ln === divider) {
            return maxWidth
        } else if (ln.length > maxWidth) {
            return ln.length
        } else {
            return maxWidth
        }
    }, 0)
    const divString = "".padEnd(divLength, "-")

    // Return
    const result = lineStrs
        .map((ln) => {
            if (ln === divider) {
                return divString
            } else {
                return ln
            }
        })
        .join("\n")
    return result
}

function padCenter(text, maxWidth: number) {
    text = text.toString()
    const remWidth = maxWidth - text.length
    const padRight = Math.floor(remWidth / 2)
    const padLeft = remWidth - padRight
    const result = "".padEnd(padLeft, " ") + text + "".padEnd(padRight, " ")
    return result
}

function shortenPotency(name: string): string {
    if (name.includes("proof")) {
        return name.replace("proof", "")
    } else if (name === "juggernaut") {
        return "jugg"
    } else if (name === "capacitor") {
        return "cap"
    } else {
        return name
    }
}

function titleCase(text: string): string {
    return text.charAt(0).toLocaleUpperCase() + text.slice(1)
}
