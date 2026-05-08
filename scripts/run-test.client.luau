local ReplicatedStorage = game:GetService("ReplicatedStorage")

local ActionContext = ReplicatedStorage:WaitForChild("input-intent")

local TestEZ = require(ActionContext.include.node_modules["@rbxts"].testez.src)

local results = TestEZ.TestBootstrap:run({
	ReplicatedStorage["input-intent"].tests
})

if results.failureCount > 0 then
	error(`Failed an amount of "{results.failureCount}" tests: "{results.errors}"`)
end