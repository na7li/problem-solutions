import Component from "../permutation-visualizer"

export default function Page() {
  return <Component />
}

"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Shuffle } from "lucide-react"

interface Step {
  type: "sort" | "find_i" | "find_j" | "swap" | "reverse" | "output" | "complete"
  permutation: string
  description: string
  details: string
  highlightPositions?: number[]
  i?: number
  j?: number
}

export default function Component() {
  const [input, setInput] = useState("abc")
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [allPermutations, setAllPermutations] = useState<string[]>([])

  // Helper functions (JavaScript versions of C functions)
  const swapChars = (str: string, i: number, j: number): string => {
    const arr = str.split("")
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
    return arr.join("")
  }

  const sortPermutation = (str: string): string => {
    return str.split("").sort().join("")
  }

  const reverseSubstring = (str: string, start: number, end: number): string => {
    const arr = str.split("")
    while (start < end) {
      const temp = arr[start]
      arr[start] = arr[end]
      arr[end] = temp
      start++
      end--
    }
    return arr.join("")
  }

  const generateSteps = useCallback((inputStr: string) => {
    if (!inputStr || inputStr.length === 0) return

    const newSteps: Step[] = []
    const permutations: string[] = []
    let current = sortPermutation(inputStr)
    const length = current.length

    // Step 1: Sort the initial permutation
    if (current !== inputStr) {
      newSteps.push({
        type: "sort",
        permutation: current,
        description: "Initial Sort",
        details: `Sorted input "${inputStr}" to get lexicographically smallest permutation`,
        highlightPositions: Array.from({ length }, (_, i) => i),
      })
    }

    // Add first permutation
    newSteps.push({
      type: "output",
      permutation: current,
      description: "Output Permutation",
      details: `Generated permutation: "${current}"`,
      highlightPositions: [],
    })
    permutations.push(current)

    let stepCount = 0
    const maxSteps = 1000 // Prevent infinite loops

    while (stepCount < maxSteps) {
      // Find the rightmost character that is smaller than its next character
      let i = length - 2
      while (i >= 0 && current[i] >= current[i + 1]) {
        i--
      }

      if (i < 0) {
        // No more permutations
        newSteps.push({
          type: "complete",
          permutation: current,
          description: "Algorithm Complete",
          details: "No more permutations possible - all permutations generated!",
          highlightPositions: [],
        })
        break
      }

      newSteps.push({
        type: "find_i",
        permutation: current,
        description: "Find Pivot Position",
        details: `Found position i=${i} where current[${i}]='${current[i]}' < current[${i + 1}]='${current[i + 1]}'`,
        highlightPositions: [i, i + 1],
        i,
      })

      // Find the smallest character to the right of i that's larger than current[i]
      let j = length - 1
      while (current[j] <= current[i]) {
        j--
      }

      newSteps.push({
        type: "find_j",
        permutation: current,
        description: "Find Swap Position",
        details: `Found position j=${j} where current[${j}]='${current[j]}' > current[${i}]='${current[i]}'`,
        highlightPositions: [i, j],
        i,
        j,
      })

      // Swap characters at positions i and j
      current = swapChars(current, i, j)
      newSteps.push({
        type: "swap",
        permutation: current,
        description: "Swap Characters",
        details: `Swapped characters at positions ${i} and ${j}`,
        highlightPositions: [i, j],
        i,
        j,
      })

      // Reverse the suffix starting at position i+1
      current = reverseSubstring(current, i + 1, length - 1)
      newSteps.push({
        type: "reverse",
        permutation: current,
        description: "Reverse Suffix",
        details: `Reversed substring from position ${i + 1} to ${length - 1}`,
        highlightPositions: Array.from({ length: length - i - 1 }, (_, idx) => i + 1 + idx),
      })

      // Output the new permutation
      newSteps.push({
        type: "output",
        permutation: current,
        description: "Output Permutation",
        details: `Generated permutation: "${current}"`,
        highlightPositions: [],
      })
      permutations.push(current)

      stepCount++
    }

    setSteps(newSteps)
    setAllPermutations(permutations)
    setCurrentStep(0)
  }, [])

  const generatePermutations = () => {
    if (input.trim()) {
      generateSteps(input.trim())
      setIsPlaying(false)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const reset = () => {
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying)
  }

  // Auto-play effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 1500)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentStep, steps.length])

  const currentStepData = steps[currentStep]
  const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1))

  const getCurrentPermutationCount = (): number => {
    if (steps.length === 0) return 0

    let count = 0
    for (let i = 0; i <= currentStep; i++) {
      if (steps[i]?.type === "output") {
        count++
      }
    }
    return count
  }

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case "sort":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "find_i":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "find_j":
        return "bg-green-100 text-green-800 border-green-200"
      case "swap":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "reverse":
        return "bg-red-100 text-red-800 border-red-200"
      case "output":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "complete":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold text-gray-800">
              <Shuffle className="w-8 h-8 text-blue-600" />
              Permutation Algorithm Visualization
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              <strong>Algorithm:</strong> Lexicographic Permutation Generation
              <br />
              This algorithm generates all permutations of a string in lexicographic (dictionary) order. Enter any
              string to see how your C code would process it step by step!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3 max-w-md mx-auto">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter string (e.g., abc)"
                className="flex-1 h-12 text-lg border-2 focus:border-blue-500 transition-colors"
              />
              <Button
                onClick={generatePermutations}
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                size="lg"
              >
                Generate Steps
              </Button>
            </div>

            {input && (
              <div className="text-center text-gray-600 bg-blue-50 rounded-lg p-3 max-w-md mx-auto">
                <strong>Input:</strong> "{input}" ({input.length} characters, {new Set(input).size} unique)
              </div>
            )}
          </CardContent>
        </Card>

        {steps.length > 0 && (
          <div>
            {/* Step Visualization Card - Fixed Height */}
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-gray-800">Step-by-Step Visualization</CardTitle>
                    <div className="text-sm text-gray-500 mt-1">
                      Step {currentStep + 1} of {steps.length}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      size="sm"
                      variant="outline"
                      className="h-10 px-4 bg-transparent"
                    >
                      <SkipBack className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      onClick={toggleAutoPlay}
                      size="sm"
                      variant="outline"
                      className={`h-10 px-4 ${isPlaying ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}
                    >
                      {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                      {isPlaying ? "Pause" : "Auto Play"}
                    </Button>
                    <Button
                      onClick={nextStep}
                      disabled={currentStep === steps.length - 1}
                      size="sm"
                      variant="outline"
                      className="h-10 px-4 bg-transparent"
                    >
                      Next
                      <SkipForward className="w-4 h-4 ml-1" />
                    </Button>
                    <Button
                      onClick={reset}
                      size="sm"
                      variant="outline"
                      className="h-10 px-4 bg-gray-50 border-gray-200"
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Fixed height container */}
                <div className="h-80 flex flex-col justify-start pt-4">
                  {currentStepData && (
                    <div className="space-y-6">
                      {/* String Visualization */}
                      <div className="text-center">
                        <div className="text-5xl font-mono tracking-wider mb-4 flex justify-center items-center gap-2">
                          {currentStepData.permutation.split("").map((char, index) => (
                            <span
                              key={index}
                              className={`inline-block px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                                currentStepData.highlightPositions?.includes(index)
                                  ? "bg-yellow-200 text-yellow-900 border-yellow-400 shadow-lg transform scale-110"
                                  : "bg-gray-100 text-gray-800 border-gray-300 shadow-sm"
                              }`}
                            >
                              {char}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Step Information */}
                      <div className="text-center space-y-4">
                        <Badge
                          variant="secondary"
                          className={`text-lg px-6 py-3 border-2 ${getStepTypeColor(currentStepData.type)}`}
                        >
                          {currentStepData.description}
                        </Badge>

                        <div className="bg-blue-50 rounded-lg p-4 max-w-2xl mx-auto">
                          <p className="text-gray-700 font-medium">{currentStepData.details}</p>
                        </div>

                        {/* Code Display */}
                        {currentStepData.type === "find_i" && currentStepData.i !== undefined && (
                          <div className="bg-gray-900 text-green-400 font-mono text-sm p-3 rounded-lg max-w-xl mx-auto">
                            while (permuta[i] {">"} permuta[i + 1] && i != -1) i--;
                          </div>
                        )}
                        {currentStepData.type === "find_j" &&
                          currentStepData.i !== undefined &&
                          currentStepData.j !== undefined && (
                            <div className="bg-gray-900 text-green-400 font-mono text-sm p-3 rounded-lg max-w-xl mx-auto">
                              while (permuta[j] {"<"} permuta[i]) j--;
                            </div>
                          )}
                        {currentStepData.type === "swap" &&
                          currentStepData.i !== undefined &&
                          currentStepData.j !== undefined && (
                            <div className="bg-gray-900 text-green-400 font-mono text-sm p-3 rounded-lg max-w-xl mx-auto">
                              swap_chars(&permuta[{currentStepData.i}], &permuta[{currentStepData.j}]);
                            </div>
                          )}
                        {currentStepData.type === "reverse" && (
                          <div className="bg-gray-900 text-green-400 font-mono text-sm p-3 rounded-lg max-w-xl mx-auto">
                            revers(permuta, {currentStepData.highlightPositions?.[0]},{" "}
                            {currentStepData.highlightPositions?.[currentStepData.highlightPositions.length - 1]});
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Bottom Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Permutations List */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
                    📝 All Permutations Generated
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Complete list of permutations in lexicographic order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <ul className="space-y-2">
                      {allPermutations.slice(0, getCurrentPermutationCount()).map((perm, index) => (
                        <li
                          key={index}
                          className={`flex items-center gap-3 font-mono p-3 rounded-lg border transition-all duration-200 ${
                            currentStepData?.type === "output" && currentStepData.permutation === perm
                              ? "bg-blue-100 border-blue-300 shadow-md transform scale-105"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <span className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></span>
                          <span className="text-lg">{perm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 text-center">
                    <Badge variant="outline" className="text-sm px-4 py-2">
                      {getCurrentPermutationCount()} of {allPermutations.length} permutations generated
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Algorithm Summary */}
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">🎯 Algorithm Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                    <div className="font-semibold text-gray-800">Time Complexity: O(n! × n)</div>
                    <div className="text-sm text-gray-600">where n is the length of the string</div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                    <div className="font-semibold text-gray-800">Space Complexity: O(1)</div>
                    <div className="text-sm text-gray-600">in-place permutation generation</div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
                    <div className="font-semibold text-gray-800">
                      Total Permutations: {input ? factorial(input.length) : 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      {input.length}! = {input ? factorial(input.length) : 0}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="font-semibold text-gray-800 mb-2">Algorithm Steps:</div>
                    <ol className="text-sm text-gray-600 space-y-1">
                      <li>1. Sort string to get first permutation</li>
                      <li>2. Find rightmost ascending pair</li>
                      <li>3. Find smallest larger character</li>
                      <li>4. Swap the characters</li>
                      <li>5. Reverse the suffix</li>
                      <li>6. Repeat until no more permutations</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
