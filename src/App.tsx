import { useState } from "react"
import { Plus, X, RotateCcw, ChevronDown } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function App() {
  const [lines, setLines] = useState([
    { id: "1", direction: "Over", line: "", odds: "" },
    { id: "2", direction: "Over", line: "", odds: "" },
  ])

  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), direction: "Over", line: "", odds: "" }])
  }

  const removeLine = (id: string) => {
    if (lines.length > 2) setLines(lines.filter(l => l.id !== id))
  }

  const clearAll = () => {
    setLines([
      { id:"1", direction:"Over", line: "", odds: "" },
      { id:"2", direction:"Over", line: "", odds: "" },
    ])
  }

  const updateLine = (id: string, field: string, val: string)=> {
    setLines(lines.map(l => l.id === id ? { ...l, [field]:val } : l))
  }

  const toProb = (odds: number) => odds < 0? -odds / (-odds + 100) : 100 / (odds + 100)

  const calcDist = () => {
    const valid = lines.filter(l => l.line&&l.odds)
    if (valid.length < 2) return []

    const probabilities=new Map()

    valid.forEach(line => {
      const lv = parseFloat(line.line)
      const oddsVal = parseFloat(line.odds)
      if (isNaN(lv) || isNaN(oddsVal)) return

      let prob = toProb(oddsVal)
      if (line.direction==="Under") prob = 1 - prob
      probabilities.set(lv, prob)
    })

    const sortedLines = Array.from(probabilities.keys()).sort((a,b) => a - b)
    const dist = []

    const min = sortedLines[0]
    const max = sortedLines[sortedLines.length - 1]
    const minOutcome = Math.floor(min)+1
    const maxOutcome = Math.floor(max) 

    dist.push({range: `≤ ${minOutcome-1}`,prob: 1-probabilities.get(min) })

    for (let i = minOutcome; i <= maxOutcome; i++) {
      const pLow = probabilities.get(i-0.5)
      const pHigh = probabilities.get(i+0.5)
      if (pLow!==undefined && pHigh !== undefined)  {
        const pushProb=pLow - pHigh
        
              console.log(pushProb)
              console.log(i, pushProb)
        dist.push({ range: `${i}`, prob:pushProb })
      }
    }

    dist.push({ range: `≥ ${maxOutcome+1}`, prob: probabilities.get(max)})
    return dist
  }

  const dist = calcDist()
  const totalProb = dist.reduce((sum, d)=>sum+d.prob,0)
  const chartData = dist.map(d=>({ name: d.range, probability: Number((d.prob *100).toFixed(2)) }))

  const getColor=(probability: number) => {
    if (probability > 52) return "#29f77b"
    if (probability < 48) return "#eb2751"
    return "#fc9920"
  }

  return (
    <div className ="min-h-screen bg-bgDark p-4 sm:p-6 lg:p-10 xl:p-12" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        .font-display { font-family: 'Poppins', sans-serif; }
        .glow-cyan:hover { filter: drop-shadow(0 0 10px #00f3ff); }
        .glow-red:hover { filter: drop-shadow(0 0 10px #ff4444); }
      `}</style>

      <div className="max-w-7xl mx-auto">
        <div className="mb-12 sm:mb-16 lg:mb-20 xl:mb-24 text-center px-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2">
            <span style = {{ color: '#d30000' }}>Odd</span>Scout Probability Distribution Visualizer
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 lg:gap-12 items-start">
          <div className ="bg-inputBg border border-accent/20 rounded-xl p-6 lg:p-8">
            <div className = "flex items-center justify-between mb-6 lg:mb-8">
              <h2 className ="text-xl lg:text-2xl font-semibold text-white">Odds Lines</h2>
              <button
                onClick={clearAll}
                className=  "flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 text-sm lg:text-base text-accent hover:text-[#7ef9ff] font-bold transition-all glow-cyan"
              >
                <RotateCcw size={16} className="lg:w-5 lg:h-5" />
                Clear
              </button>
            </div>

            <div className="space-y-4 lg:space-y-5">
              {lines.map((ln,i)=>(
                <div key={ln.id}>
                  <div className ="flex items-center gap-3 mb-2 lg:mb-3">
                    <span className="text-accent font-semibold text-sm lg:text-base">Line {i+1}</span>
                    {lines.length >2 && (
                      <button
                        onClick={()=>removeLine(ln.id)}
                        className="ml-auto p-1.5 lg:p-2 text-accent hover:text-red-400 rounded-lg transition-all glow-red"
                      >
                        <X size={16} className="lg:w-5 lg:h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 lg:gap-4">
                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-white mb-2.5 mt-3 text-center">Direction</label>
                      <div className ="relative">
                        <select
                          value={ln.direction}
                          onChange={e => updateLine(ln.id, "direction", e.target.value)}
                          className="w-full px-3 py-2 lg:px-4 lg:py-2.5 bg-bgDark border border-accent/30 text-white text-sm lg:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all appearance-none pr-8"
                        >
                          <option>Over</option>
                          <option>Under</option>
                        </select>
                        <ChevronDown size={14} className ="absolute right-2 top-1/2 -translate-y-1/2 text-accent pointer-events-none lg:w-4 lg:h-4" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs lg:text-sm font-medium text-white  mb-2.5 mt-3 text-center">Line</label>
                      <input
                        type="text"
                        value= {ln.line}
                        onChange={e=>updateLine(ln.id, "line", e.target.value)}
                        placeholder={i===0 ? "28.5" : "29.5"}
                        className ="w-full px-3 py-2 lg:px-4 lg:py-2.5 bg-bgDark border border-accent/30 text-white text-sm lg:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all placeholder:text-white/30 "
                      />
                    </div>

                    <div>
                      <label className ="block text-xs lg:text-sm font-medium text-white mb-2.5 mt-3 text-center">Odds</label>
                      <input
                        type="text"
                        value={ln.odds}
                        onChange={e => updateLine(ln.id, "odds", e.target.value)}
                        placeholder={i===0 ? "-110":"+150"}
                        className="w-full px-3 py-2 lg:px-4 lg:py-2.5 bg-bgDark border border-accent/30 text-white text-sm lg:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all placeholder:text-white/30"
                      />
                    </div>
                  </div>

                  {i !== lines.length  -1  && 
                  <div className="mt-4 lg:mt-5 border-b border-accent/10"></div>}
                </div>
              ))}
            </div>

            <button
              onClick={addLine}
              className = " mt-6 lg:mt-8 w-full flex items-center justify-center gap-2 px-4 py-3 lg:px-5 lg:py-3.5 bg-accent text-bgDark font-semibold text-base lg:text-lg rounded-lg hover:bg-accentHover transition-colors "
            >
              <Plus size={ 18 } className="lg:w-5 lg:h-5" />
              Add Line
            </button>
          </div>

          <div className=  "flex flex-col justify-center space-y-10 lg:space-y-14">
            {dist.length >0? (
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-16 items-center justify-center">
                <div className="w-full max-w-sm lg:max-w-lg">
                  <div className = "overflow-hidden border border-accent/20 rounded-lg">
                    <table className= "w-full bg-inputBg">
                      <thead className = "bg-bgDark">
                        <tr>
                          <th className =" px-8 py-3 lg:px-10 lg:py-4 text-center text-sm lg:text-base font-semibold text-accent font-display">Outcome</th>
                          <th className="px-8 py-3 lg:px-10 lg:py-4 text-center text-sm lg:text-base font-semibold text-accent font-display">Probability</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-accent/10">
                        {dist.map((d,index) =>(
                          <tr key={index} className = "hover:bg-bgDark/50 transition-colors">
                            <td className = "px-8 py-3 lg:px-10 lg:py-4 text-sm lg:text-base text-white font-medium text-center font-display"> {d.range} </td>
                            <td className=" px-8 py-3 lg:px-10 lg:py-4 text-sm lg:text-base text-white text-center font-display ">{(d.prob * 100).toFixed(2)} % </td>
                          </tr>
                        ))}
                        <tr className= "bg-accent/10 font-semibold ">
                          <td className = "px-8 py-3 lg:px-10 lg:py-4 text-sm lg:text-base text-accent text-center font-display">TOTAL</td>
                          <td className = "px-8 py-3 lg:px-10 lg:py-4 text-sm lg:text-base text-accent text-center font-display ">{(totalProb * 100).toFixed(2)}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className=" w-full max-w-sm lg:max-w-md h-80 lg:h-96 ">
                 < ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin= {{ top:8, right:6,left: 4,  bottom: 2 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#0e7490" opacity={0.25} />
                     <XAxis 
                       dataKey="name" 
                      tick={{ fill:'#ffffff', fontSize:12 }}
                      axisLine={{ stroke: '#0e7490' }}/>
                      <YAxis 
                       tick={{ fill: '#fff', fontSize:12 }}
                       axisLine={{ stroke: '#0e7490'  }}
                       label ={{ value: 'Probability (%)',  angle: -90,position:'insideLeft', fontSize:13,dy:40, fill: '#fff' }}
                        />
                       <Tooltip
                      formatter = {(v)=>`${v}%`} 
                         contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #00f3ff' }}
                         itemStyle={{ color: '#ffffff' }}
                         labelStyle={{ color: '#ffffff' }}
                             cursor={false}
                          />
                       <Bar dataKey="probability" fill ="#00f3ff" radius={[4,4,0,0]} />
                      </BarChart>
                  </ResponsiveContainer>
                </div>

              </div>
            ): (
              <div className="text-center py-12 lg:py-16 text-white text-base lg:text-lg">
                <p> Add at least 2 valid odds lines to see the distribution </p>
              </div>
            )}

            {dist.length >0 &&  (
              <div className="w-full max-w-3xl lg:max-w-4xl mx-auto px-4">
                <div className = "space-y-4 lg:space-y-6">
                  {dist.map((d,index) => {
                    const pct=d.prob*100
                    const color=getColor(pct)
                   
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm lg:text-base mb-2">
                          <span  className="font-lg text-white font-display">{d.range}</span>
                        </div>
                        <div className="h-10 lg:h-14 bg-bgDark border border-accent/10 rounded-lg overflow-hidden">
                          <div
                            className ="h-full transition-all duration-500 flex items-center justify-center"
                            style={{
                              width: `${Math.max(pct,2)}%`,
                              background: `linear-gradient(to right, ${color}, ${color}dd)`,
                              borderTopLeftRadius:6,
                              borderTopRightRadius:6,
                              borderBottomLeftRadius:0,
                              borderBottomRightRadius:0
                            }}
                          >
                            {d.prob > 0.05&& (
                              <span className = "text-white text-[10px] lg:text-sm font-bold font-display">{pct.toFixed(1)}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  } ) }
                </div>
              </div>
            ) }
          </div>
        </div>
      </div>
    </div>
  )
}