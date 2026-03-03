local ReplicatedStorage = game:GetService("ReplicatedStorage")

local ActionContext = ReplicatedStorage:WaitForChild("ActionContext")

local TestEZ = require(ActionContext.include.node_modules["@rbxts"].testez.src)

local results = TestEZ.TestBootstrap:run({
	ReplicatedStorage.ActionContext.Tests
})

if results.failureCount > 0 then
	error(`Failed an amount of "{results.failureCount}" tests: "{results.errors}"`)
end