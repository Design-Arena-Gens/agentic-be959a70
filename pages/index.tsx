import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'

const GRID_SIZE = 50
const CELL_SIZE = 10

interface Cell {
  x: number
  y: number
  alive: boolean
}

export default function GameOfLife() {
  const [grid, setGrid] = useState<boolean[][]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [generation, setGeneration] = useState(0)
  const [speed, setSpeed] = useState(100)

  // Initialize grid
  useEffect(() => {
    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false))
    setGrid(newGrid)
  }, [])

  // Count living neighbors
  const countNeighbors = useCallback((grid: boolean[][], x: number, y: number): number => {
    let count = 0
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue
        const newX = x + i
        const newY = y + j
        if (newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE) {
          if (grid[newX][newY]) count++
        }
      }
    }
    return count
  }, [])

  // Apply Game of Life rules
  const nextGeneration = useCallback((currentGrid: boolean[][]): boolean[][] => {
    return currentGrid.map((row, x) =>
      row.map((cell, y) => {
        const neighbors = countNeighbors(currentGrid, x, y)
        if (cell) {
          // Living cell
          return neighbors === 2 || neighbors === 3
        } else {
          // Dead cell
          return neighbors === 3
        }
      })
    )
  }, [countNeighbors])

  // Game loop
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setGrid(prevGrid => {
        const newGrid = nextGeneration(prevGrid)
        setGeneration(prev => prev + 1)
        return newGrid
      })
    }, speed)

    return () => clearInterval(interval)
  }, [isRunning, speed, nextGeneration])

  // Toggle cell state
  const toggleCell = (x: number, y: number) => {
    if (isRunning) return
    setGrid(prevGrid => {
      const newGrid = [...prevGrid]
      newGrid[x] = [...newGrid[x]]
      newGrid[x][y] = !newGrid[x][y]
      return newGrid
    })
  }

  // Clear grid
  const clearGrid = () => {
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false)))
    setGeneration(0)
  }

  // Randomize grid
  const randomizeGrid = () => {
    const newGrid = Array(GRID_SIZE).fill(null).map(() =>
      Array(GRID_SIZE).fill(null).map(() => Math.random() < 0.3)
    )
    setGrid(newGrid)
    setGeneration(0)
  }

  // Preset patterns
  const addGlider = () => {
    const newGrid = [...grid]
    const centerX = Math.floor(GRID_SIZE / 2)
    const centerY = Math.floor(GRID_SIZE / 2)
    
    // Glider pattern
    newGrid[centerX - 1][centerY] = true
    newGrid[centerX][centerY + 1] = true
    newGrid[centerX + 1][centerY - 1] = true
    newGrid[centerX + 1][centerY] = true
    newGrid[centerX + 1][centerY + 1] = true
    
    setGrid(newGrid)
  }

  const addPulsar = () => {
    const newGrid = [...grid]
    const centerX = Math.floor(GRID_SIZE / 2)
    const centerY = Math.floor(GRID_SIZE / 2)
    
    // Pulsar pattern
    const pattern = [
      [2, 4], [2, 5], [2, 6], [2, 10], [2, 11], [2, 12],
      [4, 2], [4, 7], [4, 9], [4, 14],
      [5, 2], [5, 7], [5, 9], [5, 14],
      [6, 2], [6, 7], [6, 9], [6, 14],
      [7, 4], [7, 5], [7, 6], [7, 10], [7, 11], [7, 12],
      [9, 4], [9, 5], [9, 6], [9, 10], [9, 11], [9, 12],
      [10, 2], [10, 7], [10, 9], [10, 14],
      [11, 2], [11, 7], [11, 9], [11, 14],
      [12, 2], [12, 7], [12, 9], [12, 14],
      [14, 4], [14, 5], [14, 6], [14, 10], [14, 11], [14, 12]
    ]
    
    pattern.forEach(([x, y]) => {
      if (centerX + x < GRID_SIZE && centerY + y < GRID_SIZE) {
        newGrid[centerX + x][centerY + y] = true
      }
    })
    
    setGrid(newGrid)
  }

  return (
    <>
      <Head>
        <title>Conway's Game of Life</title>
        <meta name="description" content="Interactive Conway's Game of Life implementation" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-white">
            Conway's Game of Life
          </h1>
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Game Grid */}
            <div className="flex-1">
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
                <div className="grid gap-1" style={{ 
                  gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                  width: 'fit-content',
                  margin: '0 auto'
                }}>
                  {grid.map((row, x) =>
                    row.map((cell, y) => (
                      <div
                        key={`${x}-${y}`}
                        className={`w-2.5 h-2.5 border border-gray-600 cursor-pointer transition-all duration-150 ${
                          cell 
                            ? 'bg-white shadow-lg' 
                            : 'bg-gray-800 hover:bg-gray-700'
                        }`}
                        onClick={() => toggleCell(x, y)}
                        style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="lg:w-80">
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">Controls</h2>
                  <p className="text-sm text-gray-300 mb-4">
                    Generation: <span className="font-mono text-white">{generation}</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsRunning(!isRunning)}
                      className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                        isRunning
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {isRunning ? 'Pause' : 'Play'}
                    </button>
                    <button
                      onClick={clearGrid}
                      disabled={isRunning}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                    >
                      Clear
                    </button>
                  </div>

                  <button
                    onClick={randomizeGrid}
                    disabled={isRunning}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                  >
                    Randomize
                  </button>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Speed: {speed}ms
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="500"
                      step="50"
                      value={speed}
                      onChange={(e) => setSpeed(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-300">Preset Patterns</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={addGlider}
                        disabled={isRunning}
                        className="py-2 px-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-all"
                      >
                        Glider
                      </button>
                      <button
                        onClick={addPulsar}
                        disabled={isRunning}
                        className="py-2 px-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-all"
                      >
                        Pulsar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-400 space-y-1">
                  <p><strong>Rules:</strong></p>
                  <p>• Any live cell with 2-3 neighbors survives</p>
                  <p>• Any dead cell with 3 neighbors becomes alive</p>
                  <p>• All other cells die or stay dead</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}